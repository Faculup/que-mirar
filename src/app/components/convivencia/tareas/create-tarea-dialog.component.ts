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

  private convivenciaService = inject(ConvivenciaService);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTareaDialogComponent>
  ) {
    this.tareaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      completed: [false],
      isRecurring: [false],
      recurringDays: [
        { value: 7, disabled: true },
        [Validators.min(1), Validators.required],
      ],
      endDate: [{ value: null, disabled: true }],
      roomId: [null, Validators.required],
    });

    this.selectedRoom$ = this.convivenciaService.selectedRoom$;

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
  }

  ngOnInit(): void {
    // Set roomId field value when a room is selected
    this.selectedRoom$.subscribe((room) => {
      if (room) {
        this.tareaForm.patchValue({ roomId: room.id });
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
          roomId: formValues.roomId,
          endDate: null,
          createdBy: user.uid, // Add creator's ID
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
