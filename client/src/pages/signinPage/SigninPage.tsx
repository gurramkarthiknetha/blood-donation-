import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignInPage.css';
import { ClerkAuth } from '../../components/ClerkAuth';

function SignInPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('donor');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // We don't automatically redirect if signed in
  // This allows the user to see the sign-in UI even when navigating to /donor

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/login', {
        ...formData,
        role: userType
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.role) {
        navigate(
          response.data.role === 'donor' ? '/donor' :
          response.data.role === 'hospital' ? '/hospital' : '/admin'
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data?.message || 'An error occurred during login');
      } else {
        setError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="signin-container">
      <div className="signin-tabs">
        <button className="tab-btn active">Sign in with Clerk</button>
        <button className="tab-btn">Traditional Sign In</button>
      </div>

      <div className="signin-content">
        {/* Clerk Authentication */}
        <div className="clerk-auth-wrapper">
          <ClerkAuth mode="signin" />
        </div>

        {/* Traditional Authentication */}
        <div className="signin-card" style={{ display: 'none' }}>
          <div className="signin-header">
            <h1>Sign In</h1>
            <p>Welcome back! Please login to your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

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
    </div>
  );
}

export default SignInPage;
