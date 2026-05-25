import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, ...rest }: ButtonProps) => (
  <button className={`btn btn--${variant}`} {...rest}>
    {children}
  </button>
);

export default Button;
