export const NavBar = ({ items = [] }) => (
  <nav className="nav-bar">
    <ul>
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href}>{item.label}</a>
        </li>
      ))}
    </ul>
  </nav>
);
