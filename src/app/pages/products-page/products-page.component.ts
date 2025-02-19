import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ProductsListComponent } from '../../components/products/products-list/products-list.component';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ProductsListComponent,
    CommonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
})
export default class ProductsPageComponent {
  private productsService = inject(ProductsService);
  private pageIndex = signal(0);
  protected pageSize = signal(10);

  protected products = this.productsService.products;
  protected isLoading = this.productsService.isLoading;
  protected errorMessage = this.productsService.errorMessage;
  protected dataIsStale = this.productsService.dataIsStale;

  protected paginatedProducts = computed(() => {
    const all = this.products();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return all.slice(startIndex, endIndex);
  });

  protected onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected refresh() {
    this.productsService.reloadData();
  }
}
