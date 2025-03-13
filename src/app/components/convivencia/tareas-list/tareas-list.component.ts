import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tareas-list',
  imports: [],
  templateUrl: './tareas-list.component.html',
  styleUrl: './tareas-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TareasListComponent { }
