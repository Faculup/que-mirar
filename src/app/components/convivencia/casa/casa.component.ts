import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, switchMap, concat } from 'rxjs';
import { Casa } from '../../../models/casa.model';
import { Room } from '../../../models/room.model';
import { CasaService } from '../../../services/casa.service';
import { ConvivenciaService } from '../../../services/convivencia.service';
import { AuthService } from '../../../services/auth.service';
import { CreateCasaDialogComponent } from './create-casa-dialog.component';
import { CreateRoomDialogComponent } from './create-room-dialog.component';
import { AssignUsersDialogComponent } from './assign-users-dialog.component';

@Component({
  selector: 'app-casa',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './casa.component.html',
  styleUrls: ['./casa.component.scss'],
})
export class CasaComponent implements OnInit {
  casas$: Observable<Casa[]> = of([]);
  rooms$: Observable<Room[]> = of([]);
  selectedCasa: Casa | null = null;
  selectedRoom: Room | null = null;

  private casaService = inject(CasaService);
  private convivenciaService = inject(ConvivenciaService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    // Get casas for the current user
    this.loadUserCasas();

    // Subscribe to room selection changes
    this.convivenciaService.selectedRoom$.subscribe((room) => {
      this.selectedRoom = room;
    });
  }

  loadUserCasas(): void {
    // Use authState$ instead of user$
    this.casas$ = this.authService.authState$.pipe(
      switchMap((user) => {
        if (user) {
          return this.casaService.getCasasByUserId(user.uid);
        }
        return of([]);
      })
    );
  }

  onCasaSelect(casa: Casa): void {
    this.selectedCasa = casa;
    this.convivenciaService.selectCasa(casa);

    // Load rooms for this casa
    this.rooms$ = this.casaService.getRoomsByCasaId(casa.id);
  }

  onRoomSelect(room: Room): void {
    this.selectedRoom = room;
    this.convivenciaService.selectRoom(room);
  }

  isRoomSelected(room: Room): boolean {
    return this.selectedRoom?.id === room.id;
  }

  openCreateCasaDialog(): void {
    const dialogRef = this.dialog.open(CreateCasaDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createCasa(result);
      }
    });
  }

  openCreateRoomDialog(): void {
    if (!this.selectedCasa) {
      alert('Please select a house first');
      return;
    }

    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '500px',
      data: { casa: this.selectedCasa },
    });

    // Set the casa property in the dialog component
    dialogRef.componentInstance.casa = this.selectedCasa;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createRoom(result);
      }
    });
  }

  async createCasa(casa: Partial<Casa>): Promise<void> {
    try {
      await this.casaService.addCasa(casa);
      // Reload the list of houses
      this.loadUserCasas();
    } catch (error) {
      // Handle error silently
    }
  }

  async createRoom(room: Partial<Room>): Promise<void> {
    try {
      await this.casaService.addRoom(room);
      // Reload the list of rooms for the current casa
      if (this.selectedCasa) {
        this.rooms$ = this.casaService.getRoomsByCasaId(this.selectedCasa.id);
      }
    } catch (error) {
      // Handle error silently
    }
  }

  openAssignUsersDialog(): void {
    if (!this.selectedCasa) {
      alert('Please select a house first');
      return;
    }

    // Make sure we have the latest version of the casa
    this.casaService
      .getCasaById(this.selectedCasa.id)
      .subscribe((latestCasa) => {
        if (latestCasa) {
          // Ensure assignedUsers exists
          if (!latestCasa.assignedUsers) {
            latestCasa.assignedUsers = [];
          }

          const dialogRef = this.dialog.open(AssignUsersDialogComponent, {
            width: '500px',
            data: { casa: latestCasa },
          });

          dialogRef.afterClosed().subscribe((userIds) => {
            if (userIds && Array.isArray(userIds)) {
              this.updateAssignedUsers(latestCasa.id, userIds);
            }
          });
        }
      });
  }

  updateAssignedUsers(casaId: string, userIds: string[]): void {
    // First, get current assignments
    this.casaService
      .getAssignedUserIds(casaId)
      .pipe(
        switchMap((currentUserIds) => {
          const operations: Observable<void>[] = [];

          // Handle special case when no operations are needed
          if (
            operations.length === 0 &&
            JSON.stringify(currentUserIds.sort()) ===
              JSON.stringify(userIds.sort())
          ) {
            return of(null);
          }

          // Remove users who are no longer selected
          currentUserIds.forEach((userId) => {
            if (!userIds.includes(userId)) {
              operations.push(
                this.casaService.removeUserFromCasa(casaId, userId)
              );
            }
          });

          // Add new users who weren't previously assigned
          userIds.forEach((userId) => {
            if (!currentUserIds.includes(userId)) {
              operations.push(
                this.casaService.assignUserToCasa(casaId, userId)
              );
            }
          });

          if (operations.length === 0) {
            return of(null);
          }

          // Return concat observable of all operations
          return concat(...operations);
        })
      )
      .subscribe({
        next: (result) => {
          if (result === null) {
            // Even if no changes, still refresh to ensure UI is consistent
            this.refreshSelectedCasa(casaId);
          }
        },
        complete: () => {
          // Refresh the casa data to update the UI with a slight delay to ensure Firestore is updated
          setTimeout(() => this.refreshSelectedCasa(casaId), 500);
        },
        error: () => {
          // Handle error silently
        },
      });
  }

  // Helper method to refresh the selected casa after changes
  refreshSelectedCasa(casaId: string): void {
    this.casaService.getCasaById(casaId).subscribe({
      next: (updatedCasa) => {
        if (updatedCasa) {
          this.selectedCasa = updatedCasa;

          // Ensure casa has assignedUsers array
          if (!this.selectedCasa.assignedUsers) {
            this.selectedCasa.assignedUsers = [];
          }

          // Explicitly create a new object to ensure change detection
          const casaCopy = { ...this.selectedCasa };
          this.convivenciaService.selectCasa(casaCopy);
        }
      },
      error: () => {
        // Handle error silently
      },
    });
  }
}
