import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private http = inject(HttpClient);

  getAllLocations(center: { lat: number; lng: number }) {
    const url = `https://api.nicobytes.store/api/v1/locations`; // ✅ No hardcoded query params
    return this.http.get<Location[]>(url, {
      params: {
        origin: `${center.lat},${center.lng}`,
        // Número de puntos
        size: 55,
      },
    });
  }
}

// https://api.nicobytes.store/api/v1/locations?size=10&origin=4.6436,-74.214214

// Maps APi key
// AIzaSyBuJ5d9JmyGMrnNPN2tUSmRQUttu8Ee5Lo
