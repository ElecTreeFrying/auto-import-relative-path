import { ReactNode } from 'react';

interface CardProps {
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}

export const Card = ({ title, footer, children }: CardProps) => (
  <article className="card">
    <header className="card__header">{title}</header>
    <div className="card__body">{children}</div>
    {footer && <footer className="card__footer">{footer}</footer>}
  </article>
);
