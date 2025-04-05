import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toastService } from '../../services/toastService';
import './SigninPage.css';

function SigninPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('donor');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      switch (userType) {
        case 'donor':
          response = await authService.loginDonor(formData);
          break;
        case 'hospital':
          response = await authService.loginHospital(formData);
          break;
        case 'admin':
          response = await authService.loginAdmin(formData);
          break;
        default:
          throw new Error('Invalid user type');
      }

      toastService.success('Login successful!');
      navigate(userType === 'donor' ? '/donor' : 
              userType === 'hospital' ? '/receiver' : '/admin');
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Login failed. Please try again.');
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
      <div className="signin-box">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User Type</label>
            <select 
              className="form-control"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-danger w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SigninPage;