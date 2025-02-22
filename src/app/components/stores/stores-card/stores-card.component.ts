import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import Product from '../../../models/product.model';

@Component({
  selector: 'app-stores-card',
  imports: [],
  templateUrl: './stores-card.component.html',
  styleUrl: './stores-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresCardComponent {
  public product = input<Product | undefined>(undefined);

  ngOnInit() {
    console.log(this.product());
  }
}
