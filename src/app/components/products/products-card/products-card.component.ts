import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import Product from '../../../models/product.model';

@Component({
  selector: 'app-products-card',
  imports: [],
  templateUrl: './products-card.component.html',
  styleUrl: './products-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCardComponent {
  public product = input<Product | undefined>(undefined);

  ngOnInit() {
    console.log(this.product());
  }
}
