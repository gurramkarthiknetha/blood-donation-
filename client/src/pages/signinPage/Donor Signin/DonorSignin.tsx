import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import donor from '../../../assets/donor.png'
import './DonorSignin.css'

const DonorSignin = () => {
  const [isSigninOpen, setIsSigninOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authService.loginDonor({ email, password })
      navigate('/donor')
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="role-card donor">
      <div className="role-icon">
        <img src={donor} alt="Donor icon" />
      </div>
      <h2>Donor</h2>
      <p>Donate blood, track history, earn rewards</p>
      
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

export default DonorSignin
