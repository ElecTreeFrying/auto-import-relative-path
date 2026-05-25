type Reducer<S, A> = (state: S, action: A) => S;
type Subscriber<S> = (state: S) => void;

export default class Store<S, A> {
  private state: S;
  private readonly subscribers = new Set<Subscriber<S>>();

  constructor(private readonly reducer: Reducer<S, A>, initialState: S) {
    this.state = initialState;
  }

  getState(): S {
    return this.state;
  }

  dispatch(action: A): void {
    this.state = this.reducer(this.state, action);
    this.subscribers.forEach((sub) => sub(this.state));
  }

  subscribe(subscriber: Subscriber<S>): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }
}
