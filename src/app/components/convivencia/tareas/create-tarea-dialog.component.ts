import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Tarea } from '../../../models/tarea.model';
import { ConvivenciaService } from '../../../services/convivencia.service';
import { Room } from '../../../models/room.model';
import { Observable, of, switchMap, first } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  Timestamp,
} from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth.service';
import { CasaService } from '../../../services/casa.service';
import { Casa } from '../../../models/casa.model';

@Component({
  selector: 'app-create-tarea-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './create-tarea-dialog.component.html',
  styleUrls: ['./create-tarea-dialog.component.scss'],
})
export class CreateTareaDialogComponent implements OnInit {
  tareaForm: FormGroup;
  selectedRoom$: Observable<Room | null>;
  availableRooms$: Observable<Room[]>;
  availableCategories$: Observable<Casa[]>;
  isCategoryHouse = false;

  private convivenciaService = inject(ConvivenciaService);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private casaService = inject(CasaService);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTareaDialogComponent>
  ) {
    this.tareaForm = this.fb.group({
      categoryId: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      completed: [false],
      isRecurring: [false],
      recurringDays: [
        { value: 7, disabled: true },
        [Validators.min(1), Validators.required],
      ],
      endDate: [{ value: null, disabled: true }],
      roomId: [{ value: null, disabled: true }],
    });

    this.selectedRoom$ = this.convivenciaService.selectedRoom$;

    // Get available categories for the current user
    this.availableCategories$ = this.authService.authState$.pipe(
      switchMap((user) => {
        if (user) {
          return this.casaService.getCasasByUserId(user.uid);
        }
        return of([]);
      })
    );

    // Get available rooms based on selected casa
    this.availableRooms$ = this.convivenciaService.selectedCasa$.pipe(
      switchMap((casa) => {
        if (casa) {
          const roomsCollection = collection(this.firestore, 'rooms');
          const roomsQuery = query(
            roomsCollection,
            where('casaId', '==', casa.id)
          );
          return collectionData(roomsQuery, { idField: 'id' }) as Observable<
            Room[]
          >;
        }
        return of([] as Room[]);
      })
    );

    // Enable/disable recurring fields based on isRecurring value
    this.tareaForm.get('isRecurring')?.valueChanges.subscribe((isRecurring) => {
      const recurringDaysControl = this.tareaForm.get('recurringDays');
      const endDateControl = this.tareaForm.get('endDate');

      if (isRecurring) {
        recurringDaysControl?.enable();
        endDateControl?.enable();
      } else {
        recurringDaysControl?.disable();
        endDateControl?.disable();
      }
    });

    // Watch for category changes
    this.tareaForm.get('categoryId')?.valueChanges.subscribe((categoryId) => {
      if (categoryId) {
        // Find the selected category to check if it's a house
        this.availableCategories$.pipe(first()).subscribe((categories) => {
          const selectedCategory = categories.find((c) => c.id === categoryId);
          this.isCategoryHouse = selectedCategory?.isHouse || false;

          // Enable/disable room selection based on if category is a house
          const roomIdControl = this.tareaForm.get('roomId');
          if (this.isCategoryHouse) {
            roomIdControl?.enable();
            roomIdControl?.setValidators(Validators.required);
            // Update convivenciaService with selected casa to load rooms
            if (selectedCategory) {
              this.convivenciaService.selectCasa(selectedCategory);
            }
          } else {
            roomIdControl?.disable();
            roomIdControl?.clearValidators();
            roomIdControl?.setValue(null);
          }
          roomIdControl?.updateValueAndValidity();
        });
      }
    });
  }

  ngOnInit(): void {
    // Set roomId field value when a room is selected
    this.selectedRoom$.subscribe((room) => {
      if (room) {
        this.tareaForm.patchValue({ roomId: room.id });
      }
    });

    // Check if a category is already selected in the service
    this.convivenciaService.selectedCasa$.pipe(first()).subscribe((casa) => {
      if (casa) {
        this.tareaForm.patchValue({ categoryId: casa.id });
      }
    });
  }

  onSubmit(): void {
    if (this.tareaForm.valid) {
      // Get current user ID
      this.authService.authState$.pipe(first()).subscribe((user) => {
        if (!user) {
          console.error('User not authenticated');
          return;
        }

        const formValues = this.tareaForm.getRawValue();

        // Create base tarea object with required fields
        const tarea: Omit<Tarea, 'id'> = {
          title: formValues.title,
          description: formValues.description || '',
          completed: formValues.completed,
          createdAt: Timestamp.now(),
          isRecurring: formValues.isRecurring,
          roomId: formValues.roomId, // This will be null if category is not a house
          categoryId: formValues.categoryId, // Add the category ID to the task
          endDate: null,
          createdBy: user.uid,
        };

        // Only add recurring fields if isRecurring is true
        if (formValues.isRecurring) {
          tarea.recurringDays = formValues.recurringDays;

          if (formValues.endDate) {
            tarea.endDate = Timestamp.fromDate(formValues.endDate);
          }
        }

        this.dialogRef.close(tarea);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
