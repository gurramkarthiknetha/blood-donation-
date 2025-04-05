import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { IoLocationSharp } from "react-icons/io5";
import { FaAmbulance } from "react-icons/fa";
import { BiCalendarCheck } from "react-icons/bi";
import { MdPersonAdd } from "react-icons/md";
import { GiWaterDrop } from "react-icons/gi";
import { FaHeart } from "react-icons/fa";
import donationImage from '../../assets/donation.png';
import {useNavigate} from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate();
  const handleSignIn = () => {
    navigate('/signinPage');
  }
  return (
    <div className="lifeflow-app">
     

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h1 className="hero-title">Be the reason someone lives today.</h1>
              <p className="hero-subtitle">Find donors, request blood, or schedule your next donation.</p>
              <div className="hero-buttons">
                <button className="btn btn-danger me-3" onClick={handleSignIn}>Become a Donor</button>
                <button className="btn btn-outline-danger me-3" onClick={handleSignIn}>Request Blood</button>
                <button className="btn btn-dark" onClick={handleSignIn}>Find Blood Banks</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="service-cards">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card service-card">
                <div className="card-body">
                  <div className="icon-container location">
                  <IoLocationSharp />
                  </div>
                  <h5 className="card-title">Find Donors Nearby</h5>
                  <p className="card-text">Connect with verified blood donors in your area within minutes.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card service-card">
                <div className="icon-container emergency">
                  <FaAmbulance />
                </div>
                <h5 className="card-title">Emergency Requests</h5>
                <p className="card-text">Post urgent blood requirements and get immediate assistance.</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card service-card">
                <div className="icon-container schedule">
                <BiCalendarCheck/>
                </div>
                <h5 className="card-title">Schedule Donations</h5>
                <p className="card-text">Book your donation slots at verified blood banks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="quick-search">
        <div className="container">
          <h2 className="section-title">Quick Search for Blood Availability</h2>
          <div className="search-container">
            <div className="row">
              <div className="col-md-4">
                <select className="form-select">
                  <option>Select Blood Group</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>
              <div className="col-md-5">
                <input type="text" className="form-control" placeholder="Your Location or Pincode" />
              </div>
              <div className="col-md-3">
                <button className="btn btn-danger w-100">Search</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Requirements Section */}
      <section className="urgent-requirements">
        <div className="container">
          <h2 className="section-title">Urgent Blood Requirements</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card requirement-card">
                <div className="card-body">
                  <div className="blood-type">A+</div>
                  <h5 className="req-title">City Hospital, New York</h5>
                  <p className="req-details">Posted 2 hours ago</p>
                  <button className="btn btn-danger w-100">Donate Now</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card requirement-card">
                <div className="card-body">
                  <div className="blood-type">O-</div>
                  <h5 className="req-title">Memorial Hospital, Chicago</h5>
                  <p className="req-details">Posted 1 hour ago</p>
                  <button className="btn btn-danger w-100">Donate Now</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card requirement-card">
                <div className="card-body">
                  <div className="blood-type">B+</div>
                  <h5 className="req-title">General Hospital, Boston</h5>
                  <p className="req-details">Posted 30 minutes ago</p>
                  <button className="btn btn-danger w-100">Donate Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn About Donation */}
      <section className="learn-about-donation">
        <div className="container">
          <h2 className="section-title text-bold">Learn About Donation</h2>
          <div className="row">
            <div className="col-md-6">
              
              <div className="donation-illustration">
                <img src={donationImage} alt="Blood donation illustration" className="img-fluid" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="compatible-types">
                <h3 className="compatible-title">Compatible Blood Type Donors</h3>
                <table className="table table-bordered compatibility-table">
                  <thead>
                    <tr>
                      <th>Blood Type</th>
                      <th>Donate Blood To</th>
                      <th>Receive Blood From</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>A+</td>
                      <td>A+, AB+</td>
                      <td>A+, A-, O+, O-</td>
                    </tr>
                    <tr>
                      <td>O+</td>
                      <td>O+, A+, B+, AB+</td>
                      <td>O+, O-</td>
                    </tr>
                    <tr>
                      <td>B+</td>
                      <td>B+, AB+</td>
                      <td>B+, B-, O+, O-</td>
                    </tr>
                    <tr>
                      <td>AB+</td>
                      <td>AB+</td>
                      <td>Everyone</td>
                    </tr>
                    <tr>
                      <td>A-</td>
                      <td>A+, A-, AB+, AB-</td>
                      <td>A-, O-</td>
                    </tr>
                    <tr>
                      <td>O-</td>
                      <td>Everyone</td>
                      <td>O-</td>
                    </tr>
                    <tr>
                      <td>B-</td>
                      <td>B+, B-, AB+, AB-</td>
                      <td>B-, O-</td>
                    </tr>
                    <tr>
                      <td>AB-</td>
                      <td>AB+, AB-</td>
                      <td>AB-, A-, B-, O-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="row">
            <div className="col-md-4 step">
              <div className="step-icon">
              <MdPersonAdd className='me-2'/>
              </div>
              <h5>Register</h5>
              <p>Create your account to explore all the tools</p>
            </div>
            <div className="col-md-4 step">
              <div className="step-icon">
                <GiWaterDrop />
              </div>
              <h5>Donate/Request</h5>
              <p>Schedule, coordinate or request blood donation</p>
            </div>
            <div className="col-md-4 step">
              <div className="step-icon">
                <FaHeart />
              </div>
              <h5>Save Lives</h5>
              <p>Make a difference in someone's life</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;