import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStatsService {
  private firestore = inject(Firestore);

  // Points rewarded for task completion
  private readonly TASK_COMPLETION_POINTS = 10;

  // Get user points
  getUserPoints(userId: string): Observable<number> {
    const userStatsRef = doc(this.firestore, `userStats/${userId}`);
    return from(getDoc(userStatsRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data()['points'] || 0;
        }
        // Initialize user stats if they don't exist
        this.initializeUserStats(userId);
        return 0;
      })
    );
  }

  // Initialize user stats document
  private async initializeUserStats(userId: string): Promise<void> {
    const userStatsRef = doc(this.firestore, `userStats/${userId}`);
    await setDoc(userStatsRef, {
      points: 0,
      tasksCompleted: 0,
      tasksCreated: 0,
      lastUpdated: new Date(),
    });
  }

  // Award points for completing a task
  awardTaskCompletionPoints(userId: string): Observable<void> {
    const userStatsRef = doc(this.firestore, `userStats/${userId}`);
    return from(
      updateDoc(userStatsRef, {
        points: increment(this.TASK_COMPLETION_POINTS),
        tasksCompleted: increment(1),
        lastUpdated: new Date(),
      })
    );
  }

  // Record task creation
  recordTaskCreation(userId: string): Observable<void> {
    const userStatsRef = doc(this.firestore, `userStats/${userId}`);
    return from(
      updateDoc(userStatsRef, {
        tasksCreated: increment(1),
        lastUpdated: new Date(),
      })
    );
  }
}
