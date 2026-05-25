type Listener<T> = (payload: T) => void;

export abstract class EventBus<TMap extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof TMap, Set<Listener<TMap[keyof TMap]>>>();

  on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener as Listener<TMap[keyof TMap]>);
    this.listeners.set(event, set);
    return () => set.delete(listener as Listener<TMap[keyof TMap]>);
  }

  protected emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }

  abstract destroy(): void;
}

export class InMemoryEventBus<TMap extends Record<string, unknown>> extends EventBus<TMap> {
  publish<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    this.emit(event, payload);
  }

  destroy(): void {
    // no-op
  }
}
