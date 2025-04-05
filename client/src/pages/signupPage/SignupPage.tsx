import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toastService } from '../../services/toastService';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('donor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    phoneNumber: '',
    address: '',
    location: {
      type: 'Point',
      coordinates: [] as number[]
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toastService.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        ...formData,
        role: userType
      };

      if (userType === 'donor') {
        await authService.registerDonor(registrationData);
        toastService.success('Registration successful! Please sign in.');
        navigate('/signin');
      } else if (userType === 'hospital') {
        await authService.registerHospital(registrationData);
        toastService.success('Registration successful! Please sign in.');
        navigate('/signin');
      }
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  console.log(handleSubmit)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  console.log(formData)
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join our blood donation community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
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
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">{userType === 'donor' ? 'Full Name' : 'Hospital Name'}</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder={userType === 'donor' ? "Enter your full name" : "Enter hospital name"}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
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
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          {userType === 'donor' && (
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="">Select Blood Group</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
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
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="signup-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/signin">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;