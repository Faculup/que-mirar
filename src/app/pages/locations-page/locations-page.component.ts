import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { LocationsService } from '../../services/locations.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-locations-page',
  imports: [GoogleMap, FormsModule, MapAdvancedMarker, MapInfoWindow],
  templateUrl: './locations-page.component.html',
  styleUrl: './locations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LocationsPageComponent {
  readonly #locationsService = inject(LocationsService);

  infoWindowRef = viewChild.required(MapInfoWindow);
  markersRef = viewChildren(MapAdvancedMarker);

  center = signal<google.maps.LatLngLiteral>({ 
    lat: 36.0144, 
    lng: -5.6028 
  });

  zoom = signal(12.5);

  locations$ = this.#locationsService.getAllLocations(this.center());

  $locations = toSignal(this.locations$, {
    initialValue: [],
  });

  openInfoWindow(location: any, marker: MapAdvancedMarker) {
    console.log('Location clicked', location);

    const content = `
      <div>
        <h2 class="text-red-500">${location.name}</h2>
        <p>${location.description
          .split(' ')
          .slice(0, 20)
          .join(' ')}...</p>
        <p>${location.address}</p>
        <p>${location.city}, ${location.state} ${location.zip

        }</
        p>
        <p>${location.phone}</p>
      </div>
    `

    this.infoWindowRef().open(marker, false, content);
  }

  goToPlace(location: any, position: number) {
    const markers = this.markersRef();

    const markerRef = markers[position];

    this.openInfoWindow(location, markerRef);


  }
}
