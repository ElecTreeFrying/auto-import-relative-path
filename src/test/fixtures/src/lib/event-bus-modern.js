export class EventBus {
  #listeners = new Map();

  on(event, listener) {
    const set = this.#listeners.get(event) ?? new Set();
    set.add(listener);
    this.#listeners.set(event, set);
    return () => set.delete(listener);
  }

  emit(event, payload) {
    this.#listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const SYSTEM_EVENT = Symbol('system-event');

export default new EventBus();
