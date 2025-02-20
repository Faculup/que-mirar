import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ProductsListComponent } from '../../components/products/products-list/products-list.component';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';

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
    ScrollingModule,
  ],
})
export default class ProductsPageComponent {
  private productsService = inject(ProductsService);

  // Expose service signals as component properties.
  protected products = this.productsService.products;
  protected isLoading = this.productsService.isLoading;
  protected errorMessage = this.productsService.errorMessage;
  protected pageSizeOptions = [5, 10, 25];

  // Total count for the paginator.
  get totalProductsCount(): number {
    return this.productsService.getTotalProductsCount();
  }

  // Track the service’s current page index.
  protected get pageIndex(): number {
    return this.productsService.getPageIndex();
  }

  // Trigger page changes via the updatePage method on the service.
  protected onPageChange(event: PageEvent) {
    this.productsService.updatePage(event.pageIndex, event.pageSize);
  }

  // Refresh data by reloading the current page.
  protected refresh() {
    this.productsService.reloadData();
  }
}
