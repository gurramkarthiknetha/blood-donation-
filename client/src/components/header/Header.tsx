import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">LifeFlow</div>
      <nav className="nav-links">
        <a href="#">Home</a>
        <a href="#">Find Donors</a>
        <a href="#">Donate blood</a>
        <a href="#">About Us</a>
      </nav>
      <div className="auth-buttons">
        <button className="btn-outline">Sign In</button>
        <button className="btn-filled">Register</button>
      </div>
    </header>
  );
}

export default Header;
