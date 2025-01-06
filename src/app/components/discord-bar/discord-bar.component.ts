import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-discord-bar',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './discord-bar.component.html',
  styleUrl: './discord-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscordBarComponent {}
