export interface Category {
  id: string;
  name: string;
  address?: string;
  description?: string;
  userId: string; // Owner of the category
  assignedUsers?: string[]; // Array of user IDs assigned to this category
  isHouse: boolean; // Whether this category represents a house (for Home) or not (for other types like Compras)
}

// For backwards compatibility with existing code
export type Casa = Category;
