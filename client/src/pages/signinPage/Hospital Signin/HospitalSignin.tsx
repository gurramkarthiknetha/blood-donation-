import './HospitalSignin.css'
import hospital from '../../../assets/hospital.png'
const HospitalSignin = () => {
  return (
    <div className="role-card hospital">
      <div className="role-icon">
        <img src={hospital} alt="Hospital icon" />
      </div>
      <h2>Hospital</h2>
      <p>Manage patient requests & inventory</p>
      <div className="button-group">
        <button className="sign-in-btn">Sign In</button>
        <button className="register-btn">Register</button>
      </div>
    </div>
  )
}

export default HospitalSignin