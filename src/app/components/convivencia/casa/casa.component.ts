import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Room {
  id: number;
  name: string;
  selected: boolean;
  position: string;
}

@Component({
  selector: 'app-casa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './casa.component.html',
  styleUrl: './casa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasaComponent {
  rooms = signal<Room[]>([
    { id: 1, name: 'Kitchen', selected: false, position: 'top-left' },
    { id: 2, name: 'Living Room', selected: false, position: 'top-right' },
    { id: 3, name: 'Bedroom', selected: false, position: 'middle' },
    { id: 4, name: 'Bathroom', selected: false, position: 'bottom-left' },
    { id: 5, name: 'Office', selected: false, position: 'bottom-right' }
  ]);

  toggleRoomSelection(selectedRoom: Room): void {
    this.rooms.update(currentRooms => 
      currentRooms.map(room => ({
        ...room,
        selected: room.id === selectedRoom.id ? !room.selected : room.selected
      }))
    );
  }
}
