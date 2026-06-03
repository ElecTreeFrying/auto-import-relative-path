import { forwardRef } from 'react';

export const ForwardedInput = forwardRef(({ label, ...rest }, ref) => (
  <label className="forwarded-input">
    <span>{label}</span>
    <input ref={ref} {...rest} />
  </label>
));

ForwardedInput.displayName = 'ForwardedInput';
