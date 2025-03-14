import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreboardComponent } from '../../components/convivencia/scoreboard/scoreboard.component';

import { CasaComponent } from '../../components/convivencia/casa/casa.component';
import { TareasListComponent } from '../../components/convivencia/tareas/tareas-list.component';

@Component({
  selector: 'app-convivencia-page',
  imports: [
    CommonModule,
    ScoreboardComponent,
    TareasListComponent,
    CasaComponent,
  ],
  templateUrl: './convivencia-page.component.html',
  styleUrl: './convivencia-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConvivenciaPageComponent {}
