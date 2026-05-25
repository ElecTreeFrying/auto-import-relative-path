interface SpinnerProps {
  label?: string;
}

export const Spinner = ({ label = 'Loading…' }: SpinnerProps) => (
  <div className="spinner" role="status" aria-label={label}>
    <span className="spinner__dot" />
    <span className="spinner__dot" />
    <span className="spinner__dot" />
  </div>
);
