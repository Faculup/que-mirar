import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Casa } from '../models/casa.model';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class CasaService {
  private firestore = inject(Firestore);

  // Fetch all casas for a specific user
  getCasasByUserId(userId: string): Observable<Casa[]> {
    const casasCollection = collection(this.firestore, 'casas');
    const userCasasQuery = query(
      casasCollection,
      where('userId', '==', userId)
    );
    return collectionData(userCasasQuery, { idField: 'id' }) as Observable<
      Casa[]
    >;
  }

  // Fetch rooms for a specific casa
  getRoomsByCasaId(casaId: string): Observable<Room[]> {
    const roomsCollection = collection(this.firestore, 'rooms');
    const casaRoomsQuery = query(
      roomsCollection,
      where('casaId', '==', casaId)
    );
    return collectionData(casaRoomsQuery, { idField: 'id' }) as Observable<
      Room[]
    >;
  }

  // Add a new casa
  async addCasa(casa: Partial<Casa>): Promise<void> {
    await addDoc(collection(this.firestore, 'casas'), casa);
  }

  // Add a new room to a casa
  async addRoom(room: Partial<Room>): Promise<void> {
    await addDoc(collection(this.firestore, 'rooms'), room);
  }

  // Assign a user to a casa
  assignUserToCasa(casaId: string, userId: string): Observable<void> {
    const casaRef = doc(this.firestore, `casas/${casaId}`);
    return from(
      updateDoc(casaRef, {
        assignedUsers: arrayUnion(userId),
      })
    );
  }

  // Remove a user assignment from a casa
  removeUserFromCasa(casaId: string, userId: string): Observable<void> {
    const casaRef = doc(this.firestore, `casas/${casaId}`);
    return from(
      updateDoc(casaRef, {
        assignedUsers: arrayRemove(userId),
      })
    );
  }

  // Get houses where a user is assigned (not just owned)
  getAssignedCasasByUserId(userId: string): Observable<Casa[]> {
    const casasCollection = collection(this.firestore, 'casas');
    const assignedCasasQuery = query(
      casasCollection,
      where('assignedUsers', 'array-contains', userId)
    );
    return collectionData(assignedCasasQuery, { idField: 'id' }) as Observable<
      Casa[]
    >;
  }

  // Get all users who are assigned to a specific casa
  getAssignedUserIds(casaId: string): Observable<string[]> {
    const casaRef = doc(this.firestore, `casas/${casaId}`);
    return from(getDoc(casaRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data()?.['assignedUsers'] || [];
        }
        return [];
      })
    );
  }

  // Get a single casa by ID
  getCasaById(casaId: string): Observable<Casa | null> {
    const casaRef = doc(this.firestore, `casas/${casaId}`);
    return from(getDoc(casaRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: casaId, ...(docSnap.data() as Omit<Casa, 'id'>) };
        }
        return null;
      })
    );
  }

  // Delete a category and its associated rooms
  async deleteCategory(categoryId: string): Promise<void> {
    // First, get all rooms associated with this category
    const roomsCollection = collection(this.firestore, 'rooms');
    const roomsQuery = query(
      roomsCollection,
      where('casaId', '==', categoryId)
    );

    // Get all rooms linked to this category
    const roomSnapshot = await getDocs(roomsQuery);

    // Delete each room
    const batch = writeBatch(this.firestore);
    roomSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the category itself
    const categoryRef = doc(this.firestore, `casas/${categoryId}`);
    batch.delete(categoryRef);

    // Commit the batch
    return batch.commit();
  }
}
