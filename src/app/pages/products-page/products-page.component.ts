import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Observable } from 'rxjs';
import Product from '../../models/product.model';
import { ProductsListComponent } from '../../components/products/products-list/products-list.component';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductsListComponent, CommonModule, MatPaginatorModule],
})
export default class ProductsPageComponent {
  private productsService = inject(ProductsService);
  private pageIndex = signal(0);
  protected pageSize = signal(10);

  // Observable to hold products data
  products = toSignal(this.productsService.getProducts(), {
    initialValue: [] as Product[],
  });

  paginatedProducts = computed(() => {
    const all = this.products();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return all.slice(startIndex, endIndex);
  });

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
