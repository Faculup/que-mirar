import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavComponent } from './layout/nav/nav.component';
import { AuthModalComponent } from './components/auth/auth-modal/auth-modal.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DiscordBarComponent } from './layout/discord-bar/discord-bar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavComponent,
    AuthModalComponent,
    CommonModule,
    DiscordBarComponent,
    // SidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  auth = inject(AuthService);
}
