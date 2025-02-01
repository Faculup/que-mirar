import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Observable } from 'rxjs';
import Product from '../../models/product.model';
import { ProductsListComponent } from '../../components/products/products-list/products-list.component';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductsListComponent, CommonModule],
})
export default class ProductsPageComponent {
  private productsService = inject(ProductsService);

  // Observable to hold products data
  products = toSignal(this.productsService.getProducts(), {
    initialValue: [] as Product[],
  });
}
