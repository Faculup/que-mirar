export interface Casa {
  id: string;
  name: string;
  address?: string;
  description?: string;
  userId: string; // Owner of the house
  assignedUsers?: string[]; // Array of user IDs assigned to this house
}
