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
  /** Services */
  private firestore = inject(Firestore);
  private productCollection = collection(this.firestore, 'products');

  /** Pagination */
  private pageIndex = signal(0);
  private pageSize = signal(10);
  private pageCursors: Array<QueryDocumentSnapshot<DocumentData> | null> = [
    null,
  ];
  private totalProductsCount = signal<number>(0);

  /** Resource */
  private paginatedProductsResource = rxResource({
    request: () => ({
      page: this.pageIndex(),
      size: this.pageSize(),
    }),
    loader: (params) => {
      const { page, size } = params.request; // Correctly extract values from the request property
      const q = this.createQueryForPage(page, size);
      return from(getDocs(q)).pipe(
        map((snapshot) => this.processSnapshot(snapshot, page))
      );
    },
  });

  /** Stale timer */
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
        }, 50000);
      }
      return false;
    },
  });

  /** Computed signals to expose resource values */
  public products = computed(
    () => this.paginatedProductsResource.value() ?? ([] as Product[])
  );

  public isLoading = this.paginatedProductsResource.isLoading;

  public error = computed(
    () => this.paginatedProductsResource.error() as HttpErrorResponse
  );

  public errorMessage = computed(() =>
    setErrorMessage(this.error(), 'Product')
  );

  constructor() {
    this.loadTotalProductsCount();
    this.paginatedProductsResource.reload();
  }

  // This could be improved.
  public async loadTotalProductsCount() {
    const countQuery = query(this.productCollection);
    const snapshot = await getCountFromServer(countQuery);
    this.totalProductsCount.set(snapshot.data().count);
  }

  public updatePage(pageIndex: number, pageSize: number): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);

    if (pageIndex === 0) {
      this.pageCursors = [null];
    }

    // this.paginatedProductsResource.reload();
  }

  public getTotalProductsCount(): number {
    return this.totalProductsCount();
  }

  public reloadData(): void {
    this.paginatedProductsResource.reload();
  }

  /** Helper Organizational methods */
  private createQueryForPage(pageIndex: number, pageSize: number) {
    if (pageIndex === 0) {
      this.pageCursors[0] = null;
      return query(this.productCollection, orderBy('price'), limit(pageSize));
    }
    const cursor = this.pageCursors[pageIndex];
    return cursor
      ? query(
          this.productCollection,
          orderBy('price'),
          startAfter(cursor),
          limit(pageSize)
        )
      : query(this.productCollection, orderBy('price'), limit(pageSize));
  }

  private processSnapshot(querySnapshot: any, pageIndex: number): Product[] {
    const products: Product[] = [];
    querySnapshot.forEach((doc: any) =>
      products.push({ id: doc.id, ...doc.data() } as Product)
    );
    if (querySnapshot.docs.length > 0) {
      this.pageCursors[pageIndex + 1] =
        querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    return products;
  }
}
