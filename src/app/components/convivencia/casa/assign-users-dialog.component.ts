import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  FormControl,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Casa } from '../../../models/casa.model';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';

interface UserOption {
  id: string;
  displayName: string;
  email: string;
  isSelected: boolean;
}

// Updated to properly define dialog data interface
interface AssignUsersDialogData {
  casa: Casa;
}

@Component({
  selector: 'app-assign-users-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Assign Users to {{ casa?.name || 'House' }}</h2>
    <div mat-dialog-content>
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading users...</p>
      </div>

      <form [formGroup]="usersForm" *ngIf="!loading">
        <div class="search-container">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Search Users</mat-label>
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Search by name or email"
            />
          </mat-form-field>
        </div>

        <div class="users-list" formArrayName="users">
          <div
            *ngFor="let userOption of filteredUsers$ | async; let i = index"
            class="user-item"
          >
            <mat-checkbox [formControlName]="getControlIndex(userOption.id)">
              <div class="user-info">
                <div class="user-name">
                  {{ userOption.displayName || 'Unnamed User' }}
                </div>
                <div class="user-email">{{ userOption.email }}</div>
              </div>
            </mat-checkbox>
          </div>

          <div
            *ngIf="(filteredUsers$ | async)?.length === 0"
            class="no-users-message"
          >
            No users found matching your search.
          </div>
        </div>
      </form>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="loading"
        (click)="onSubmit()"
      >
        Assign Users
      </button>
    </div>
  `,
  styles: [
    `
      .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;

        p {
          margin-top: 10px;
          color: #666;
        }
      }

      .full-width {
        width: 100%;
      }

      .search-container {
        margin-bottom: 10px;
      }

      .users-list {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 16px;

        .user-item {
          padding: 8px 0;
          border-bottom: 1px solid #eee;

          &:last-child {
            border-bottom: none;
          }

          .user-info {
            display: inline-block;
            padding-left: 8px;

            .user-name {
              font-weight: 500;
            }

            .user-email {
              font-size: 12px;
              color: #666;
            }
          }
        }

        .no-users-message {
          padding: 16px;
          text-align: center;
          color: #666;
          font-style: italic;
        }
      }
    `,
  ],
})
export class AssignUsersDialogComponent implements OnInit {
  casa: Casa;
  usersForm: FormGroup;
  userOptions: UserOption[] = [];
  loading = true;
  idToIndexMap = new Map<string, number>();

  searchControl = new FormControl('');
  filteredUsers$: Observable<UserOption[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AssignUsersDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) private data: AssignUsersDialogData
  ) {
    // Properly retrieve the casa from injected dialog data
    this.casa = data.casa;
    console.log('Dialog received casa:', this.casa);

    this.usersForm = this.fb.group({
      users: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Ensure casa has assigned users array
    if (!this.casa.assignedUsers) {
      this.casa.assignedUsers = [];
    }

    console.log('Casa assigned users:', this.casa.assignedUsers);
    this.loadUsers();

    this.filteredUsers$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((term) => this.filterUsers(term || ''))
    );
  }

  get usersArray(): FormArray {
    return this.usersForm.get('users') as FormArray;
  }

  getControlIndex(userId: string): number {
    return this.idToIndexMap.get(userId) || 0;
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Loading users...');

    // Combine all users with the currently assigned users
    this.userService
      .getAllUsers()
      .pipe(
        map((users) => {
          console.log(`Found ${users.length} users total`);

          // Transform into UserOption objects
          const options = users.map((user, index) => {
            // Check if this user is in the assignedUsers array
            const isSelected =
              Array.isArray(this.casa.assignedUsers) &&
              this.casa.assignedUsers.includes(user.uid);

            console.log(
              `User ${user.uid} (${
                user.displayName || user.email
              }) assigned: ${isSelected}`
            );

            this.idToIndexMap.set(user.uid, index);
            return {
              id: user.uid,
              displayName:
                user.displayName || user.name || user.email || 'User',
              email: user.email || '',
              isSelected,
            };
          });

          // Create form controls
          this.usersForm = this.fb.group({
            users: this.fb.array(
              options.map((option) => new FormControl(option.isSelected))
            ),
          });

          return options;
        })
      )
      .subscribe({
        next: (options) => {
          this.userOptions = options;
          this.loading = false;
          console.log(`Loaded ${options.length} user options`);
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.loading = false;
        },
      });
  }

  filterUsers(term: string): UserOption[] {
    const filterValue = term.toLowerCase();
    return this.userOptions.filter(
      (user) =>
        user.displayName.toLowerCase().includes(filterValue) ||
        user.email.toLowerCase().includes(filterValue)
    );
  }

  onSubmit(): void {
    if (this.userOptions.length === 0 || !this.usersArray) {
      console.warn('No users available to assign');
      this.dialogRef.close([]);
      return;
    }

    const selectedUserIds = [];

    // Safely iterate through the form array
    for (let i = 0; i < this.usersArray.length; i++) {
      const control = this.usersArray.at(i);
      if (control.value === true && i < this.userOptions.length) {
        selectedUserIds.push(this.userOptions[i].id);
      }
    }

    console.log('Selected user IDs:', selectedUserIds);
    this.dialogRef.close(selectedUserIds);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
