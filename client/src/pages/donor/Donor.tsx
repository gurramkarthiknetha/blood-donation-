import React, { useState, useEffect } from 'react';
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
import { donorDashboardService } from '../../services/donorDashboardService';
import { toastService } from '../../services/toastService';
import { wsService } from '../../services/websocketService';
import LastDonation from './LastDonation';
import Notifications from './Notifications';
import RewardsBadges from './RewardsBadges';
import BookAppointment from './BookAppointment';

const Donor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    points: 0,
    nextEligibleDate: null
  });

  useEffect(() => {
    loadDonorData();
    wsService.connect();

    const unsubscribe = wsService.subscribe('notification', handleNotification);
    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      const [profileData, eligibilityData] = await Promise.all([
        donorDashboardService.getDonorProfile(),
        donorDashboardService.getEligibilityStatus()
      ]);
      
      setProfile(profileData);
      setStats({
        totalDonations: profileData.numberOfDonations || 0,
        points: profileData.points || 0,
        nextEligibleDate: eligibilityData.nextEligibleDate
      });
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Error loading donor data');
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = (notification: any) => {
    toastService.info(notification.message);
    if (notification.type === 'donation_recorded') {
      loadDonorData();
    }
  };

  if (loading) {
    return (
      <div className="donor-dashboard loading">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h2>Welcome, {profile?.fullName}</h2>
          <p>Blood Type: {profile?.bloodGroup}</p>
        </div>
        {stats.nextEligibleDate && (
          <button className="eligibility-btn" disabled={new Date(stats.nextEligibleDate) > new Date()}>
            {new Date(stats.nextEligibleDate) > new Date() 
              ? `Eligible to donate on ${new Date(stats.nextEligibleDate).toLocaleDateString()}`
              : 'Check Eligibility'}
          </button>
        )}
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Donations</h3>
          <p className="value">{stats.totalDonations}</p>
        </div>

        <div className="stat-card">
          <h3>Points Earned</h3>
          <p className="value">{stats.points}</p>
        </div>

        <div className="stat-card">
          <h3>Impact</h3>
          <p className="value">{stats.totalDonations * 3} Lives Saved</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="row">
          <div className="col-md-6">
            <LastDonation lastDonation={profile?.lastDonationDate} />
            <RewardsBadges badges={profile?.badges} points={stats.points} />
          </div>
          <div className="col-md-6">
            <Notifications />
            <BookAppointment onSuccess={loadDonorData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donor;