import { Component, MouseEvent, ReactNode } from 'react';

interface ClassButtonProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface ClassButtonState {
  pressed: boolean;
}

export class ClassButton extends Component<ClassButtonProps, ClassButtonState> {
  state: ClassButtonState = { pressed: false };

  private handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    this.setState({ pressed: true });
    this.props.onClick?.(event);
  };

  render(): ReactNode {
    return (
      <button onClick={this.handleClick} aria-pressed={this.state.pressed}>
        {this.props.children}
      </button>
    );
  }
}
