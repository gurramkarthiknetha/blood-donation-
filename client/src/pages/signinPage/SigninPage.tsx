import DonorSignin from './Donor Signin/DonorSignin'
import HospitalSignin from './Hospital Signin/HospitalSignin'
import ReceiverSignin from './Receiver Signin/ReceiverSignin'

import './SigninPage.css'

const SigninPage = () => {
  return (
    <div className="signin-page-container">
      <div className="welcome-section">
        <h1>Welcome Future Hero!</h1>
        <p>Please select your role to continue</p>
      </div>
      
      <div className="role-cards-container">
        <DonorSignin />
        <HospitalSignin />
        <ReceiverSignin />
      </div>
      
      <div className=" copyright">
        © 2025 LifeFlow. All rights reserved.
      </div>
    </div>
  )
}

export default SigninPage