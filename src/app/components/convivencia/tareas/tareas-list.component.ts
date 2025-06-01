import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  combineLatest,
  map,
  of,
  from,
} from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { catchError, first } from 'rxjs/operators';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

import { TareasService } from '../../../services/tareas.service';
import { ConvivenciaService } from '../../../services/convivencia.service';
import { Tarea } from '../../../models/tarea.model';
import { CreateTareaDialogComponent } from './create-tarea-dialog.component';
import { Room } from '../../../models/room.model';

export type CompletionFilter = 'all' | 'completed' | 'pending';

@Component({
  selector: 'app-tareas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './tareas-list.component.html',
  styleUrls: ['./tareas-list.component.scss'],
})
export class TareasListComponent implements OnInit {
  tareas$: Observable<Tarea[]> | undefined;
  currentRoom$: Observable<Room | null>;
  private completionFilterSubject = new BehaviorSubject<CompletionFilter>(
    'all'
  );
  completionFilter$ = this.completionFilterSubject.asObservable();

  private tareasService = inject(TareasService);
  private convivenciaService = inject(ConvivenciaService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private roomNamesCache = new Map<string, string>();
  private categoryNamesCache = new Map<string, string>();
  private firestore = inject(Firestore);

  constructor() {
    this.currentRoom$ = this.convivenciaService.selectedRoom$;
  }

  ngOnInit(): void {
    this.loadTareas();
  }

  loadTareas(): void {
    // Combine room selection with completion filter
    const roomTasks$ = this.convivenciaService.selectedRoom$.pipe(
      switchMap((room) => this.tareasService.getTareas(room?.id))
    );

    // Apply completion filter
    this.tareas$ = combineLatest([roomTasks$, this.completionFilter$]).pipe(
      map(([tareas, filter]) => {
        switch (filter) {
          case 'completed':
            return tareas.filter((tarea) => tarea.completed);
          case 'pending':
            return tareas.filter((tarea) => !tarea.completed);
          case 'all':
          default:
            return tareas;
        }
      })
    );
  }

  // Filter methods
  setCompletionFilter(filter: CompletionFilter): void {
    this.completionFilterSubject.next(filter);
  }

  clearAllFilters(): void {
    this.convivenciaService.selectRoom(null as any);
    this.completionFilterSubject.next('all');
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateTareaDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createTarea(result);
      }
    });
  }

  createTarea(tarea: Omit<Tarea, 'id'>): void {
    this.tareasService.addTarea(tarea).subscribe({
      next: () => console.log('Tarea created successfully'),
      error: (error) => console.error('Error creating tarea', error),
    });
  }

  deleteTarea(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tareasService.deleteTarea(id).subscribe({
        next: () => console.log('Tarea deleted successfully'),
        error: (error) => console.error('Error deleting tarea', error),
      });
    }
  }

  completeTarea(id: string): void {
    this.authService.authState$.pipe(first()).subscribe((user) => {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      this.tareasService.completeTarea(id, user.uid).subscribe({
        next: () => console.log('Task completed successfully'),
        error: (error) => console.error('Error completing task', error),
      });
    });
  }

  // Get room name by ID
  getRoomName(roomId: string): Observable<string> {
    // Check if the name is already in cache
    if (this.roomNamesCache.has(roomId)) {
      return of(this.roomNamesCache.get(roomId) || 'Unknown Room');
    }

    // Otherwise fetch from Firestore
    return from(getDoc(doc(this.firestore, 'rooms', roomId))).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const roomData = docSnap.data() as Room;
          const roomName = roomData.name || 'Unknown Room';
          // Cache the result for future use
          this.roomNamesCache.set(roomId, roomName);
          return roomName;
        }
        return 'Unknown Room';
      }),
      catchError(() => of('Unknown Room'))
    );
  }

  // Get category name by ID
  getCategoryName(categoryId: string): Observable<string> {
    if (!categoryId) {
      return of('No Category');
    }

    // Check if the name is already in cache
    if (this.categoryNamesCache.has(categoryId)) {
      return of(this.categoryNamesCache.get(categoryId) || 'Unknown Category');
    }

    // The collection name might be "categories" or "casas" depending on your Firestore structure
    // First try with "categories"
    return from(getDoc(doc(this.firestore, 'categories', categoryId))).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists()) {
          const categoryData = docSnap.data() as any;
          const categoryName = categoryData.name || 'Unknown Category';
          // Cache the result for future use
          this.categoryNamesCache.set(categoryId, categoryName);
          return of(categoryName);
        }

        // If not found in "categories", try "casas" collection
        return from(getDoc(doc(this.firestore, 'casas', categoryId))).pipe(
          map((docSnap) => {
            if (docSnap.exists()) {
              const categoryData = docSnap.data() as any;
              const categoryName = categoryData.name || 'Unknown Category';
              // Cache the result for future use
              this.categoryNamesCache.set(categoryId, categoryName);
              return categoryName;
            }
            return 'Unknown Category';
          })
        );
      }),
      catchError(() => of('Unknown Category'))
    );
  }
}
