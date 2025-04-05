import React from 'react';
import { 
  FaCalendarAlt, 
  FaDownload, 
  FaHospital, 
  FaBell, 
  FaCalendarCheck, 
  FaMedal, 
  FaHeart, 
  FaAward
} from 'react-icons/fa';
import './Donor.css';
import { BiSolidDonateBlood } from "react-icons/bi";
import { MdBloodtype } from "react-icons/md";
import { FaStar } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";


const Donor: React.FC = () => {
  return (
    <div className="donor-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, Anudeep!</h1>
          <p className="next-donation">
            Next eligible donation date: <span className="highlight-date">April 15, 2025</span>
          </p>
        </div>
        <button className="eligibility-btn">
          <span className="eligibility-icon"><FaRobot /></span> Check Eligibility
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon donation-icon"><BiSolidDonateBlood />          </div>
          <div className="stat-content">
            <div className="stat-label">Total Donations</div>
            <div className="stat-value">9</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blood-group-icon"><MdBloodtype />
          </div>
          <div className="stat-content">
            <div className="stat-label">Blood Group</div>
            <div className="stat-value">O+</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rewards-icon"><FaStar /></div>
          <div className="stat-content">
            <div className="stat-label">Reward Points</div>
            <div className="stat-value">1,250</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-column">
          <div className="section-card">
            <h2>Last Donation</h2>
            <div className="last-donation-details">
              <div className="calendar-icon">
                <FaCalendarAlt />
              </div>
              <div className="donation-info">
                <div className="donation-date">March 15, 2025</div>
                <div className="donation-location">NTR Trust,Hyderabad</div>
                <div className="donation-units">Units donated: 1</div>
              </div>
            </div>
            <button className="secondary-btn full-width">View Full History</button>
          </div>

          <div className="section-card">
            <h2>Rewards & Badges</h2>
            <div className="badges-container">
              <div className="badge-item">
                <div className="badge gold-donor">
                  <FaMedal />
                </div>
                <div className="badge-name">Gold Donor</div>
              </div>
              <div className="badge-item">
                <div className="badge life-saver">
                  <FaHeart />
                </div>
                <div className="badge-name">Life Saver</div>
              </div>
              <div className="badge-item">
                <div className="badge regular-donor">
                  <FaAward />
                </div>
                <div className="badge-name">Regular Donor</div>
              </div>
            </div>
            <div className="progress-container">
              <div className="progress-label">Progress to next badge</div>
              <div className="progress-percentage">75%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
            </div>
            <button className="secondary-btn full-width">
              <FaDownload className="btn-icon" /> Download Certificate
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          <div className="section-card">
            <h2>Book Appointment</h2>
            <div className="appointment-form">
              <div className="form-group">
                <div className="input-with-icon">
                  <FaCalendarAlt className="input-icon" />
                  <input type="text" placeholder="mm/dd/yyyy" className="text-input" />
                </div>
              </div>
              <div className="form-group">
                <div className="select-with-icon">
                  <FaHospital className="input-icon" />
                  <select className="select-input">
                    <option>Select Blood Bank</option>
                  </select>
                </div>
              </div>
              <button className="primary-btn full-width">Book Appointment</button>
            </div>
          </div>

          <div className="section-card">
            <h2>Notifications</h2>
            <div className="notifications-list">
              <div className="notification emergency">
                <div className="notification-icon">
                  <FaBell />
                </div>
                <div className="notification-content">
                  <div className="notification-title">Emergency Request</div>
                  <div className="notification-message">
                    Urgent need for O+ blood at Apollo Hospital
                  </div>
                  <button className="respond-btn">Respond Now</button>
                </div>
              </div>

              <div className="notification appointment">
                <div className="notification-icon">
                  <FaCalendarCheck />
                </div>
                <div className="notification-content">
                  <div className="notification-title">Upcoming Appointment</div>
                  <div className="notification-message">
                    May 15, 2025 at BBR Blood Bank
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donor;