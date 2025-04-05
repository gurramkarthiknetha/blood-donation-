import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import hospital from '../../../assets/hospital.png'
import './HospitalSignin.css'

const HospitalSignin = () => {
  const [isSigninOpen, setIsSigninOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authService.loginHospital({ email, password })
      navigate('/hospital')
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="role-card hospital">
      <div className="role-icon">
        <img src={hospital} alt="Hospital icon" />
      </div>
      <h2>Hospital</h2>
      <p>Manage patient requests & inventory</p>
      
      {!isSigninOpen ? (
        <div className="button-group">
          <button className="sign-in-btn" onClick={() => setIsSigninOpen(true)}>Sign In</button>
          <button className="register-btn" onClick={() => navigate('/register')}>Register</button>
        </div>
      ) : (
        <form onSubmit={handleSignIn}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="button-group">
            <button type="submit" className="sign-in-btn">Sign In</button>
            <button type="button" className="register-btn" onClick={() => setIsSigninOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default HospitalSignin