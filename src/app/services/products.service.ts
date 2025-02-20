import { HttpErrorResponse } from '@angular/common/http';
import {
  Injectable,
  computed,
  inject,
  signal,
  linkedSignal,
  ResourceStatus,
} from '@angular/core';
import {
  Firestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { rxResource } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { setErrorMessage } from '../utils/error-message';
import Product from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private firestore = inject(Firestore);
  private productCollection = collection(this.firestore, 'products');

  // Pagination state signals
  private pageIndex = signal(0);
  private pageSize = signal(10);
  private lastDocument = signal<QueryDocumentSnapshot<DocumentData> | null>(
    null
  );

  // Total count signal
  private totalProductsCount = signal<number>(0);

  // rxResource to fetch paginated products
  private paginatedProductsResource = rxResource({
    loader: () => {
      const currentPage = this.pageIndex();
      const size = this.pageSize();
      let q;
      if (currentPage === 0) {
        // For the first page, start at the beginning
        q = query(this.productCollection, orderBy('price'), limit(size));
        this.lastDocument.set(null);
      } else {
        // For subsequent pages, start after the last document of the previous page
        q = query(
          this.productCollection,
          orderBy('price'),
          startAfter(this.lastDocument()),
          limit(size)
        );
      }
      return from(getDocs(q)).pipe(
        map((querySnapshot) => {
          const products: Product[] = [];
          querySnapshot.forEach((doc) =>
            products.push({ id: doc.id, ...doc.data() } as Product)
          );
          // Update lastDocument for the next page
          if (querySnapshot.docs.length > 0) {
            this.lastDocument.set(
              querySnapshot.docs[querySnapshot.docs.length - 1]
            );
          }
          return products;
        })
      );
    },
  });

  // Computed signals to expose resource values
  products = computed(
    () => this.paginatedProductsResource.value() ?? ([] as Product[])
  );
  isLoading = this.paginatedProductsResource.isLoading;
  error = computed(
    () => this.paginatedProductsResource.error() as HttpErrorResponse
  );
  errorMessage = computed(() => setErrorMessage(this.error(), 'Product'));

  // Optional: Stale data detection using a linked signal
  private staleTimerId: any = null;
  dataIsStale = linkedSignal({
    source: this.paginatedProductsResource.status,
    computation: (status) => {
      if (this.staleTimerId) {
        clearTimeout(this.staleTimerId);
      }
      if (status === ResourceStatus.Resolved) {
        this.staleTimerId = setTimeout(() => {
          this.dataIsStale.set(true);
          this.staleTimerId = null;
        }, 5000);
      }
      return false;
    },
  });

  constructor() {
    this.loadTotalProductsCount();
    // Load the initial page of products
    this.paginatedProductsResource.reload();
  }

  /**
   * Updates pagination parameters and reloads data.
   * @param pageIndex The new page index.
   * @param pageSize The number of items per page.
   */
  updatePage(pageIndex: number, pageSize: number): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
    this.paginatedProductsResource.reload();
  }

  /**
   * Loads the total number of products.
   */
  async loadTotalProductsCount() {
    const countQuery = query(this.productCollection);
    const snapshot = await getCountFromServer(countQuery);
    this.totalProductsCount.set(snapshot.data().count);
  }

  /**
   * Returns the current total products count.
   */
  getTotalProductsCount(): number {
    return this.totalProductsCount();
  }
}
