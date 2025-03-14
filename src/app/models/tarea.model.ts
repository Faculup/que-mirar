import { Timestamp } from '@angular/fire/firestore';

export interface Tarea {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp | null;
  isRecurring: boolean;
  recurringDays?: number;
  endDate?: Timestamp | null;
  roomId?: string;
  createdBy?: string; // User ID of the task creator
  completedBy?: string; // User ID of who completed the task
}
