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
import { Casa } from '../../../models/casa.model';
import { AuthService } from '../../../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-create-casa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './create-casa-dialog.component.html',
  styleUrls: ['./create-casa-dialog.component.scss'],
})
export class CreateCasaDialogComponent {
  casaForm: FormGroup;
  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCasaDialogComponent>
  ) {
    this.casaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: [''],
      description: [''],
    });
  }

  onSubmit(): void {
    if (this.casaForm.valid) {
      // Use first() to get the current value from the Observable
      this.authService.authState$.pipe(first()).subscribe((user) => {
        if (!user) {
          console.error('No authenticated user');
          return;
        }

        const casa: Partial<Casa> = {
          ...this.casaForm.value,
          userId: user.uid,
        };

        this.dialogRef.close(casa);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
