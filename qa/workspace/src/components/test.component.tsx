import { ReactNode } from 'react';

interface TestComponentProps {
  label: string;
  children?: ReactNode;
}

export class TestComponent {
  static render({ label, children }: TestComponentProps): ReactNode {
    return (
      <section className="test-component">
        <header>{label}</header>
        {children}
      </section>
    );
  }
}
