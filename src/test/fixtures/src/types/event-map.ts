export interface AppEventMap {
  'user:signed-in': { userId: string; at: number };
  'user:signed-out': { userId: string };
  'order:created': { orderId: string; total: number };
  'order:cancelled': { orderId: string; reason: string };
  [key: `custom:${string}`]: Record<string, unknown>;
}

export type EventName = keyof AppEventMap;
export type EventPayload<E extends EventName> = AppEventMap[E];
