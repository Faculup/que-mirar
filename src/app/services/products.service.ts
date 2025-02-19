import { HttpErrorResponse } from '@angular/common/http';
import {
  Injectable,
  ResourceStatus,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { rxResource } from '@angular/core/rxjs-interop';
import { delay, map } from 'rxjs';
import { setErrorMessage } from '../utils/error-message';
import Product from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private firestore = inject(Firestore);

  private productsResource = rxResource({
    loader: () =>
      collectionData(collection(this.firestore, 'products'), {
        idField: 'id',
      }).pipe(
        delay(500),
        map((data) => data as Product[]) // Add type casting here
      ),
  });

  products = computed(() => this.productsResource.value() ?? ([] as Product[]));
  error = computed(() => this.productsResource.error() as HttpErrorResponse);
  errorMessage = computed(() => setErrorMessage(this.error(), 'Product'));
  isLoading = this.productsResource.isLoading;

  // Stale data detection
  private timerId = 0 as any;
  dataIsStale = linkedSignal({
    source: this.productsResource.status,
    computation: (status) => {
      if (this.timerId > 0) {
        clearTimeout(this.timerId);
      }
      if (status === ResourceStatus.Resolved) {
        this.timerId = setTimeout(() => {
          this.dataIsStale.set(true);
          this.timerId = 0;
        }, 5000);
      }
      return false;
    },
  });

  reloadData() {
    this.productsResource.reload();
  }
}
