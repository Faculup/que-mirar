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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Category } from '../../../models/casa.model';
import { AuthService } from '../../../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-create-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './create-category-dialog.component.html',
  styleUrls: ['./create-category-dialog.component.scss'],
})
export class CreateCategoryDialogComponent {
  categoryForm: FormGroup;
  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCategoryDialogComponent>
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: [''],
      description: [''],
      isHouse: [false], // Default value is false
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      // Use first() to get the current value from the Observable
      this.authService.authState$.pipe(first()).subscribe((user) => {
        if (!user) {
          console.error('No authenticated user');
          return;
        }

        const category: Partial<Category> = {
          ...this.categoryForm.value,
          userId: user.uid,
        };

        this.dialogRef.close(category);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
