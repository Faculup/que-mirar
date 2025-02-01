import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Product from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private firestore = inject(Firestore);

  // Fetch products from the Firestore "products" collection
  getProducts(): Observable<Product[]> {
    const productsCollection = collection(this.firestore, 'products');
    return collectionData(productsCollection, { idField: 'id' }) as Observable<
      Product[]
    >;
  }
}
