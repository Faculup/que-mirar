import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
} from '@angular/core';
import Product from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { ProductsCardComponent } from '../products-card/products-card.component';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, ProductsCardComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  products = input.required<Product[]>();
}
