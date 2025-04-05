import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toastService } from '../../services/toastService';
import { wsService } from '../../services/websocketService';
import './SignInPage.css';

function SignInPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('donor');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        ...formData,
        role: userType
      });

      // Initialize WebSocket connection after successful login
      wsService.connect();

      toastService.success('Login successful!');
      navigate(userType === 'donor' ? '/donor' :
              userType === 'hospital' ? '/hospital' : '/admin');
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>Sign In</h1>
          <p>Welcome back! Please login to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <div className="user-type-selector">
              <button 
                type="button"
                className={`type-btn ${userType === 'donor' ? 'active' : ''}`}
                onClick={() => setUserType('donor')}
              >
                Donor
              </button>
              <button 
                type="button"
                className={`type-btn ${userType === 'hospital' ? 'active' : ''}`}
                onClick={() => setUserType('hospital')}
              >
                Hospital
              </button>
              <button 
                type="button"
                className={`type-btn ${userType === 'admin' ? 'active' : ''}`}
                onClick={() => setUserType('admin')}
              >
                Admin
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>
          </div>
          
          <button 
            type="submit"
            className="signin-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="signin-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;