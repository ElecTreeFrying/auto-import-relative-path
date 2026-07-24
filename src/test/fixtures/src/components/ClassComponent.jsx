import { Component } from 'react';

export class Counter extends Component {
  state = { count: 0 };

  increment = () => this.setState({ count: this.state.count + 1 });
  decrement = () => this.setState({ count: this.state.count - 1 });

  render() {
    return (
      <div className="counter">
        <button onClick={this.decrement}>−</button>
        <output>{this.state.count}</output>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}
