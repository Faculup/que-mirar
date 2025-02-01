import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-products-card',
  imports: [],
  templateUrl: './products-card.component.html',
  styleUrl: './products-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCardComponent { }
