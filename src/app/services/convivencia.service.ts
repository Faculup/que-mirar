import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Room } from '../models/room.model';
import { Casa } from '../models/casa.model';

@Injectable({
  providedIn: 'root',
})
export class ConvivenciaService {
  // Room selection state
  private selectedRoomSubject = new BehaviorSubject<Room | null>(null);
  selectedRoom$: Observable<Room | null> =
    this.selectedRoomSubject.asObservable();

  // Casa selection state
  private selectedCasaSubject = new BehaviorSubject<Casa | null>(null);
  selectedCasa$: Observable<Casa | null> =
    this.selectedCasaSubject.asObservable();

  // Room selection
  selectRoom(room: Room): void {
    this.selectedRoomSubject.next(room);
  }

  // Casa selection
  selectCasa(casa: Casa): void {
    // Create a fresh copy to ensure change detection
    const casaCopy = { ...casa };

    // Ensure assignedUsers is always an array
    if (!casaCopy.assignedUsers) {
      casaCopy.assignedUsers = [];
    }

    this.selectedCasaSubject.next(casaCopy);

    // When casa changes, reset room selection
    this.selectedRoomSubject.next(null);
  }

  // Clear all selections
  clearSelections(): void {
    this.selectedCasaSubject.next(null);
    this.selectedRoomSubject.next(null);
  }

  // Get current casa
  getCurrentCasa(): Casa | null {
    return this.selectedCasaSubject.getValue();
  }
}
