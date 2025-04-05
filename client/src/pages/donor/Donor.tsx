import React from 'react';
import './Donor.css';
import Header from '../../components/header/Header';
import StatsCard from './StatsCard';
import LastDonation from './LastDonation';
import BookAppointment from './BookAppointment';
import RewardsBadges from './RewardsBadges';
import Notifications from './Notifications';

import { BiSolidDonateBlood } from "react-icons/bi";
import { FaRegStar } from "react-icons/fa";
import { MdBloodtype } from "react-icons/md";

const Donor: React.FC = () => {
  return (
    <div className="dashboard">

      <main className="main-content">
        <section className="welcome-section">
          <h2>Welcome back, Anudeep!</h2>
          <p>Next eligible donation date: <span className="highlighted-text">April 15, 2025</span></p>
          <button className="check-eligibility-btn">Check Eligibility</button>
        </section>

        <div className="stats-cards">
          <StatsCard icon={<BiSolidDonateBlood />} label="Total Donations" value="12" />
          <StatsCard icon={<MdBloodtype />} label="Blood Group" value="O+" />
          <StatsCard icon={<FaRegStar />} label="Reward Points" value="1,250" />
        </div>

        <div className="info-grid">
          <LastDonation />
          <BookAppointment />
        </div>

        <div className="info-grid">
          <RewardsBadges />
          <Notifications />
        </div>
      </main>

    </div>
  );
};

export default Donor;
