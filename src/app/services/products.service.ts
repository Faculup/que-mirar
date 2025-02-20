import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
} from '@angular/fire/firestore';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { setErrorMessage } from '../utils/error-message';
import Product from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private firestore = inject(Firestore);

  private pageSize = signal(10);
  private pageIndex = signal(0);
  private lastDocument = signal<any>(null);
  private productCollection = collection(this.firestore, 'products');
  private totalProductsCount = signal<number>(0);

  // Signals
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<HttpErrorResponse | null>(null);
  errorMessage = computed(() => setErrorMessage(this.error(), 'Product'));
  dataIsStale = signal<boolean>(false);

  constructor() {
    this.loadTotalProductsCount();
    this.getProductsPage(0, this.pageSize());
  }

  async getProductsPage(pageIndex: number, pageSize: number) {
    this.isLoading.set(true);
    try {
      let q;
      if (pageIndex === 0) {
        // For the first page, start at the beginning
        q = query(
          this.productCollection,
          orderBy('price'), // Or any field you want to order by
          limit(pageSize)
        );
        this.lastDocument.set(null);
      } else {
        // For subsequent pages, start after the last document of the previous page
        q = query(
          this.productCollection,
          orderBy('price'), // Or any field you want to order by
          startAfter(this.lastDocument()),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      this.products.set(products);

      // Update last document for the next page
      if (querySnapshot.docs.length > 0) {
        this.lastDocument.set(
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );
      } else {
        this.lastDocument.set(null);
      }

      this.isLoading.set(false);
      this.error.set(null);
      this.dataIsStale.set(false);
    } catch (e: any) {
      this.error.set(e);
      this.isLoading.set(false);
      this.products.set([]);
    }
  }

  async loadTotalProductsCount() {
    const countQuery = query(this.productCollection);
    const snapshot = await getCountFromServer(countQuery);
    this.totalProductsCount.set(snapshot.data().count);
  }

  getTotalProductsCount(): number {
    return this.totalProductsCount();
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
  }
}
