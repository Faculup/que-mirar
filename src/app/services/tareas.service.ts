import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collectionData,
  query,
  where,
  Timestamp,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { Tarea } from '../models/tarea.model';
import { UserStatsService } from './user-stats.service';

@Injectable({
  providedIn: 'root',
})
export class TareasService {
  private firestore = inject(Firestore);
  private userStatsService = inject(UserStatsService);
  private tareasCollection = collection(this.firestore, 'tareas');

  getTareas(roomId?: string): Observable<Tarea[]> {
    // If roomId is provided, filter tasks for that room
    if (roomId) {
      const roomTareasQuery = query(
        this.tareasCollection,
        where('roomId', '==', roomId)
      );
      return collectionData(roomTareasQuery, {
        idField: 'id',
      }) as Observable<Tarea[]>;
    }
    // Otherwise return all tasks
    return collectionData(this.tareasCollection, {
      idField: 'id',
    }) as Observable<Tarea[]>;
  }

  // Get tasks by user ID (either created by or assigned to)
  getUserTareas(userId: string): Observable<Tarea[]> {
    const userTareasQuery = query(
      this.tareasCollection,
      where('createdBy', '==', userId)
    );
    return collectionData(userTareasQuery, {
      idField: 'id',
    }) as Observable<Tarea[]>;
  }

  addTarea(tarea: Omit<Tarea, 'id'>): Observable<string> {
    return from(addDoc(this.tareasCollection, tarea)).pipe(
      tap(() => {
        if (tarea.createdBy) {
          this.userStatsService.recordTaskCreation(tarea.createdBy).subscribe();
        }
      }),
      map((docRef) => docRef.id)
    );
  }

  updateTarea(id: string, changes: Partial<Tarea>): Observable<void> {
    const docRef = doc(this.firestore, `tareas/${id}`);
    return from(updateDoc(docRef, changes));
  }

  // Complete a task
  completeTarea(id: string, userId: string): Observable<void> {
    const docRef = doc(this.firestore, `tareas/${id}`);
    return from(
      updateDoc(docRef, {
        completed: true,
        completedAt: Timestamp.now(),
        completedBy: userId,
      })
    ).pipe(
      tap(() => {
        // Award points to the user who completed the task
        this.userStatsService.awardTaskCompletionPoints(userId).subscribe();
      })
    );
  }

  deleteTarea(id: string): Observable<void> {
    const docRef = doc(this.firestore, `tareas/${id}`);
    return from(deleteDoc(docRef));
  }
}
