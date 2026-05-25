import type { Product } from './product.model';
import type { User } from './user.model';

export interface OrderLine {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer: User;
  lines: OrderLine[];
  createdAt: string;
  totalCents: number;
}
