export default interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  countInStock: number;
  brand: string;
  /** TODO -- Ticket  https://www.notion.so/823263d7498749e4bacd14a8d02c67aa?v=c01d04faa9d146e691dfb8774b12c5c5&p=18399c3d368680979403e5f53e4d062c&pm=s
   *  Create a review model
   */
  reviews: string; // TODO: Review[];
}
