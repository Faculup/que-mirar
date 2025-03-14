import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, from, map, of, catchError } from 'rxjs';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  age?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  getAllUsers(): Observable<UserProfile[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<
      UserProfile[]
    >;
  }

  getUserById(userId: string): Observable<UserProfile> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userDoc)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          return {
            uid: userId,
            displayName: data['displayName'] || data['name'] || null,
            email: data['email'] || null,
            photoURL: data['photoURL'] || null,
            name: data['name'] || null,
            phoneNumber: data['phoneNumber'] || null,
            age: data['age'] || null,
          };
        }

        // Return placeholder user data with consistent properties
        return {
          uid: userId,
          displayName: `Unknown user (${userId.slice(0, 6)}...)`,
          email: null,
          photoURL: null,
          name: null,
          phoneNumber: null,
          age: null,
        };
      }),
      catchError(() => {
        // Return placeholder user data on error
        return of({
          uid: userId,
          displayName: `User ${userId.slice(0, 6)}...`,
          email: null,
          photoURL: null,
          name: null,
          phoneNumber: null,
          age: null,
        });
      })
    );
  }
}
