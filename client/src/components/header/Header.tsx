import './Header.css';
import {Link} from 'react-router-dom'
function Header() {
  return (
    <header className="header">
      <div className="logo">LifeFlow</div>
      <nav className="nav-links">
        <Link to='/'>Home</Link>
        <Link to='/signinPage'>Find Donors</Link>
        <Link to='/signinPage'>Donate blood</Link>
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
