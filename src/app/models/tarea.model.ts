import { Timestamp } from '@angular/fire/firestore';

export interface Tarea {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  dueDate?: Timestamp | null; // Add due date field
  roomId?: string; // Optional because not all tasks might have a room
  categoryId?: string; // Added field for category association
  isRecurring: boolean;
  recurringDays?: number;
  endDate: Timestamp | null;
  createdBy: string;
  completedBy?: string;
  completedAt?: Timestamp;
}
