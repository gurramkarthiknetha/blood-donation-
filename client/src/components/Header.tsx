import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getUserData();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <header>
      <div className="header-content">
        <h1>Welcome, {user.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;