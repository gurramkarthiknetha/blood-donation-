import './DonorSignin.css'
import donor from '../../../assets/donor.png'
const DonorSignin = () => {
  return (
    <div className="role-card donor">
      <div className="role-icon">
        <img src={donor} alt="Donor icon" />
      </div>
      <h2>Donor</h2>
      <p>Donate blood, track history, earn rewards</p>
      <div className="button-group">
        <button className="sign-in-btn">Sign In</button>
        <button className="register-btn">Register</button>
      </div>
    </div>
  )
}

export default DonorSignin
