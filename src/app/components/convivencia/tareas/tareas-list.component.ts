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
} from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { first } from 'rxjs/operators';

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
}
