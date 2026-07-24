import { forwardRef, InputHTMLAttributes } from 'react';

interface ForwardRefInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const ForwardRefInput = forwardRef<HTMLInputElement, ForwardRefInputProps>(
  ({ label, ...rest }, ref) => (
    <label className="forward-ref-input">
      <span>{label}</span>
      <input ref={ref} {...rest} />
    </label>
  ),
);

ForwardRefInput.displayName = 'ForwardRefInput';
