import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      <div className="container">
        <Link className="navbar-brand" to="/">LifeFlow</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && userRole === 'donor' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/donor">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/bloodCamp">Blood Camps</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reedemPage">Rewards</Link>
                </li>
              </>
            )}
            {isAuthenticated && userRole === 'hospital' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/receiver">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/bloodCamp">Organize Camp</Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {user?.name || 'User'}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-outline-light" to="/signinPage">
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
