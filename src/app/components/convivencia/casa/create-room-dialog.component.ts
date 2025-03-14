import { Component, inject } from '@angular/core';
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
import { Room } from '../../../models/room.model';
import { Casa } from '../../../models/casa.model';

@Component({
  selector: 'app-create-room-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './create-room-dialog.component.html',
  styleUrls: ['./create-room-dialog.component.scss'],
})
export class CreateRoomDialogComponent {
  roomForm: FormGroup;
  casa: Casa;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateRoomDialogComponent>
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
    // This will be set from the component that opens this dialog
    this.casa = {} as Casa;
  }

  onSubmit(): void {
    if (this.roomForm.valid && this.casa?.id) {
      const room: Partial<Room> = {
        ...this.roomForm.value,
        casaId: this.casa.id,
      };

      this.dialogRef.close(room);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
