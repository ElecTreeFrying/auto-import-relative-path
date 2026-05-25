export const Badge = ({ label, tone = 'neutral' }) => (
  <span className={`badge badge--${tone}`}>{label}</span>
);
