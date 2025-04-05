import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'
import admin from '../../../assets/admin.png'
import './ReceiverSignin.css'

const ReceiverSignin = () => {
  const [isSigninOpen, setIsSigninOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authService.loginAdmin({ username, password })
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="role-card admin">
      <div className="role-icon">
        <img src={admin} alt="Admin icon" />
      </div>
      <h2>Admin</h2>
      <p>Monitor platform operations</p>
      
      {!isSigninOpen ? (
        <div className="button-group">
          <button className="sign-in-btn" onClick={() => setIsSigninOpen(true)}>Sign In</button>
          <button className="register-btn" onClick={() => navigate('/admin/register')}>Register</button>
        </div>
      ) : (
        <form onSubmit={handleSignIn}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

export default ReceiverSignin