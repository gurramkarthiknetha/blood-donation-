import './ReceiverSignin.css'
import admin from '../../../assets/admin.png'
const ReceiverSignin = () => {
  return (
    <div className="role-card admin">
      <div className="role-icon">
        <img src={admin}alt="Admin icon" />
      </div>
      <h2>Admin</h2>
      <p>Monitor platform operations</p>
      <div className="button-group">
        <button className="sign-in-btn">Sign In</button>
        <button className="register-btn">Register</button>
      </div>
    </div>
  )
}

export default ReceiverSignin