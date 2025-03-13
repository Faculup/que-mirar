import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  imports: [],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreboardComponent { }
