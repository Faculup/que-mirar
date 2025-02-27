import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-locations-page',
  imports: [GoogleMap],
  templateUrl: './locations-page.component.html',
  styleUrl: './locations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LocationsPageComponent {
  readonly #locationsService = inject(LocationsService);

  center = signal<google.maps.LatLngLiteral>({ lat: 24, lng: 12 });

  zoom = signal(4);

  locations$ = this.#locationsService.getAllLocations(this.center());

  $locations = toSignal(this.locations$, {
    initialValue: [],
  });
}
