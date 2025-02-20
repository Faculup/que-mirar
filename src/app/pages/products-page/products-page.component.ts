import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  protected products = this.productsService.products;
  protected isLoading = this.productsService.isLoading;
  protected errorMessage = this.productsService.errorMessage;

  protected pageSizeOptions = [5, 10, 25];

  get totalProductsCount(): number {
    return this.productsService.getTotalProductsCount();
  }

  protected onPageChange(event: PageEvent) {
    this.productsService.setPageSize(event.pageSize);
    this.productsService.getProductsPage(event.pageIndex, event.pageSize);
  }

  protected refresh() {
    //this.productsService.reloadData();
  }
}
