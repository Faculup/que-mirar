import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
} from '@angular/core';
import Product from '../../../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  products = input<Product[] | undefined>([]);
}
