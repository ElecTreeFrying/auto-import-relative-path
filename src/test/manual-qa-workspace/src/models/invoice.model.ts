import type { Order } from './order.model';

export interface Invoice {
  id: string;
  number: string;
  order: Order;
  issuedAt: string;
  paidAt: string | null;
}
