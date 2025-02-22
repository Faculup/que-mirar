import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-locations-page',
  imports: [],
  templateUrl: './locations-page.component.html',
  styleUrl: './locations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LocationsPageComponent {
  readonly #locationsService = inject(LocationsService);

  locations$ = this.#locationsService.getAllLocations({ lat: 0, lng: 0 });

  $locations = toSignal(this.locations$, {
    initialValue: [],
  });

  // locations = signal<Location[]>([
  //   {
  //     name: 'Location 1',
  //     address: '1234 Main St',
  //     city: 'Anytown',
  //     state: 'CA',
  //     zip: '12345',
  //     phone: '123-456-7890',
  //   },
  //   {
  //     name: 'Location 2',
  //     address: '5678 Elm St',
  //     city: 'Othertown',
  //     state: 'CA',
  //     zip: '54321',
  //     phone: '098-765-4321',
  //   },
  // ]);
}
