import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../components/auth/auth-modal/auth-modal.component';

@Component({
  selector: 'app-mobile-app',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    AuthModalComponent
  ],
  templateUrl: './mobile-app.component.html',
  styleUrl: './mobile-app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileAppComponent {
  auth = inject(AuthService);
}
