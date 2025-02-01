import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-discord-bar',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './discord-bar.component.html',
  styleUrl: './discord-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscordBarComponent {}
