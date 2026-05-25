export const Footer = ({ year = new Date().getFullYear() }) => (
  <footer className="footer">
    <small>© {year} Auto Import Demo. All rights reserved.</small>
  </footer>
);
