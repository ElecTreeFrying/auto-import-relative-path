export const PageHeader = ({ title, subtitle }) => (
  <header className="page-header">
    <h1>{title}</h1>
    {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
  </header>
);
