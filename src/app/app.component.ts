import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavComponent } from './layout/nav/nav.component';
import { AuthModalComponent } from './components/auth/auth-modal/auth-modal.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DiscordBarComponent } from './layout/discord-bar/discord-bar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { MobileAppComponent } from './layout/mobile-app/mobile-app.component';
import { ScreenService } from './services/screen.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavComponent,
    AuthModalComponent,
    CommonModule,
    AsyncPipe,
    DiscordBarComponent,
    SidebarComponent,
    MobileAppComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  auth = inject(AuthService);
  screenService = inject(ScreenService);

  // Expose the isMobile$ observable for the template
  isMobile$ = this.screenService.isMobile$;
}
