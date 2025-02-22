import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
} from '@angular/core';
import Product from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { StoresCardComponent } from '../stores-card/stores-card.component';

@Component({
  selector: 'app-stores-list',
  imports: [CommonModule, StoresCardComponent],
  templateUrl: './stores-list.component.html',
  styleUrl: './stores-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresListComponent {
  products = input.required<Product[]>();
}
