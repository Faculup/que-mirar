import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { TareasService } from '../../../services/tareas.service';
import { UserStatsService } from '../../../services/user-stats.service';
import { ConvivenciaService } from '../../../services/convivencia.service';
import { UserService } from '../../../services/user.service';
import {
  Observable,
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
  switchMap,
  firstValueFrom,
} from 'rxjs';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Tarea } from '../../../models/tarea.model';

interface UserScoreData {
  userId: string;
  displayName: string;
  points: number;
  pendingTasks: number;
  createdPendingTasks: number;
  completedTasks: number;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatSpinner,
    MatButtonModule,
  ],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreboardComponent implements OnInit {
  private authService = inject(AuthService);
  private tareasService = inject(TareasService);
  private userStatsService = inject(UserStatsService);
  private convivenciaService = inject(ConvivenciaService);
  private userService = inject(UserService);

  // Signals
  currentUserData = signal<UserScoreData | null>(null);
  assignedUsersData = signal<UserScoreData[]>([]);
  isLoading = signal<boolean>(false);

  // Computed value to determine if there are assigned users
  hasAssignedUsers = computed(() => this.assignedUsersData().length > 0);

  constructor() {
    // Use effect to react to casa changes
    effect(() => {
      const currentCasa = this.convivenciaService.getCurrentCasa();

      if (currentCasa) {
        const userIds = currentCasa.assignedUsers || [];

        if (userIds.length > 0) {
          this.updateAssignedUsers(userIds);
        } else {
          this.assignedUsersData.set([]);
        }
      } else {
        this.assignedUsersData.set([]);
      }
    });
  }

  async ngOnInit() {
    // Get current user data
    this.authService.authState$
      .pipe(
        switchMap((user) => {
          if (!user) return of(null);

          return combineLatest([
            of(user),
            this.userStatsService.getUserPoints(user.uid),
            this.tareasService.getUserTareas(user.uid),
          ]).pipe(
            map(([user, points, tareas]) => {
              const pendingTasks = tareas.filter((t) => !t.completed).length;
              const createdPendingTasks = tareas.filter(
                (t) => !t.completed && t.createdBy === user.uid
              ).length;
              const completedTasks = tareas.filter((t) => t.completed).length;

              return {
                userId: user.uid,
                displayName: user.displayName || 'Current User',
                points: points || 0,
                pendingTasks,
                createdPendingTasks,
                completedTasks,
              } as UserScoreData;
            })
          );
        })
      )
      .subscribe((userData) => {
        this.currentUserData.set(userData);
      });
  }

  // Method to force refresh users data
  forceRefreshUsers() {
    const currentCasa = this.convivenciaService.getCurrentCasa();
    if (currentCasa?.assignedUsers?.length) {
      this.updateAssignedUsers(currentCasa.assignedUsers, true);
    }
  }

  // Method to update assigned users data
  async updateAssignedUsers(userIds: string[], forceRefresh = false) {
    if (!userIds.length) {
      this.assignedUsersData.set([]);
      return;
    }

    this.isLoading.set(true);

    try {
      const userDataPromises = userIds.map(async (userId) => {
        try {
          // Get user profile
          const userProfile = await firstValueFrom(
            this.userService.getUserById(userId)
          );

          // Get points
          const points = await firstValueFrom(
            this.userStatsService.getUserPoints(userId)
          );

          // Get tasks
          const tareas = await firstValueFrom(
            this.tareasService.getUserTareas(userId)
          );

          // Process the data
          const pendingTasks = tareas.filter((t) => !t.completed).length;
          const createdPendingTasks = tareas.filter(
            (t) => !t.completed && t.createdBy === userId
          ).length;
          const completedTasks = tareas.filter((t) => t.completed).length;

          // Figure out the best display name
          const displayName =
            userProfile?.displayName ||
            userProfile?.name ||
            `User ${userId.slice(0, 6)}...`;

          return {
            userId,
            displayName,
            points: points || 0,
            pendingTasks,
            createdPendingTasks,
            completedTasks,
          } as UserScoreData;
        } catch (error) {
          return {
            userId,
            displayName: `User ${userId.slice(0, 6)}...`,
            points: 0,
            pendingTasks: 0,
            createdPendingTasks: 0,
            completedTasks: 0,
          } as UserScoreData;
        }
      });

      const userData = await Promise.all(userDataPromises);

      if (userData && userData.length > 0) {
        this.assignedUsersData.set(userData);
      }
    } catch {
      // Keep previous data if there's an error
    } finally {
      this.isLoading.set(false);
    }
  }
}
