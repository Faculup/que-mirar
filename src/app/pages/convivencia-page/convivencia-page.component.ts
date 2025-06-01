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
export default class ConvivenciaPageComponent {
  activeTab: string | null = 'casa'; // Default open tab
  expandedColumn: 'left' | 'center' | 'right' | null = null;

  toggleTab(tab: string): void {
    // Toggle: if clicking the same tab, close it; otherwise open the new tab
    this.activeTab = this.activeTab === tab ? null : tab;
  }

  toggleExpand(column: 'left' | 'center' | 'right'): void {
    if (this.expandedColumn === column) {
      // If already expanded, collapse it
      this.expandedColumn = null;
    } else {
      // Expand the clicked column
      this.expandedColumn = column;
    }
  }
}
