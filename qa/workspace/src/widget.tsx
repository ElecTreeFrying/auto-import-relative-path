import { ReactNode } from 'react';

interface WidgetProps {
  title: string;
  children?: ReactNode;
}

export const Widget = ({ title, children }: WidgetProps) => (
  <section className="widget">
    <h3>{title}</h3>
    {children}
  </section>
);
