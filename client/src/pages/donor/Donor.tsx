import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaDownload,
  FaHospital,
  FaBell,
  FaCalendarCheck,
  FaMedal,
  FaHeart,
  FaAward,
  FaSpinner,
  FaEdit,
  FaUserCircle,
  FaTimes
} from 'react-icons/fa';
import './Donor.css';
import { BiSolidDonateBlood } from "react-icons/bi";
import { MdBloodtype } from "react-icons/md";
import { FaStar } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";
import { useAuth, useUser, useSession } from '@clerk/clerk-react';
import { ClerkAuth } from '../../components/ClerkAuth';
import { profileService, UserProfile, DonationRecord } from '../../services/profileService';
import { authService } from '../../services/authService';
import ProfileEditForm from '../../components/ProfileEditForm';
import DonationHistory from '../../components/DonationHistory';
import AddDonationForm from '../../components/AddDonationForm';


const Donor: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    bloodGroup: 'Unknown',
    phoneNumber: '',
    address: '',
    role: 'donor',
    totalDonations: 0,
    rewardPoints: 0,
    lastDonationDate: ''
  });
  const [nextDonationDate, setNextDonationDate] = useState<string>('Not available');

  // Load user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && user) {
        try {
          setLoading(true);

          // Get session token for API authentication
          const token = session ? await session.getToken() : 'no-token';

          // Fetch user profile from backend
          const profileData = await profileService.getProfileWithClerk(
            token as string,
            user.id,
            user.primaryEmailAddress?.emailAddress || ''
          );

          // Fetch donation history
          const historyData = await profileService.getDonationHistoryWithClerk(
            token as string,
            user.id,
            user.primaryEmailAddress?.emailAddress || ''
          );

          // Update profile state
          setUserProfile({
            fullName: profileData.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: profileData.email || user.primaryEmailAddress?.emailAddress || '',
            bloodGroup: profileData.bloodGroup || 'Unknown',
            phoneNumber: profileData.phoneNumber || '',
            address: profileData.address || '',
            role: profileData.role || 'donor',
            totalDonations: profileData.totalDonations || historyData?.donations?.length || 0,
            rewardPoints: profileData.rewardPoints || 0,
            lastDonationDate: profileData.lastDonationDate || ''
          });

          // Set donation history
          if (historyData && historyData.donations) {
            setDonationHistory(historyData.donations);
          }

          // Calculate next donation date (3 months after last donation)
          if (profileData.lastDonationDate) {
            const lastDonation = new Date(profileData.lastDonationDate);
            const nextDonation = new Date(lastDonation);
            nextDonation.setMonth(nextDonation.getMonth() + 3);
            setNextDonationDate(nextDonation.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
          } else if (historyData?.donations?.length > 0) {
            const lastDonation = new Date(historyData.donations[0].donationDate);
            const nextDonation = new Date(lastDonation);
            nextDonation.setMonth(nextDonation.getMonth() + 3);
            setNextDonationDate(nextDonation.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);

          // Fallback to basic Clerk data
          setUserProfile(prevProfile => ({
            ...prevProfile,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.primaryEmailAddress?.emailAddress || '',
            bloodGroup: 'Unknown',
            role: 'donor',
            totalDonations: 0,
            rewardPoints: 0
          }));

          // Set empty donation history
          setDonationHistory([]);

          // Calculate next donation date as 3 months from today
          const nextDonation = new Date();
          nextDonation.setMonth(nextDonation.getMonth() + 3);
          setNextDonationDate(nextDonation.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));

          setLoading(false);
        }
      } else if (isLoaded) {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user, session]);

  // Handle profile save
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      if (!user || !session) return;

      const token = await session.getToken();

      // Update profile in backend
      await profileService.updateProfileWithClerk(
        token as string,
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        updatedProfile
      );

      // Update local state
      setUserProfile(updatedProfile);
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Handle adding a new donation
  const handleAddDonation = async (donationData: Partial<DonationRecord>) => {
    try {
      if (!user || !session) return;

      const token = await session.getToken();

      // Add donation in backend
      const newDonation = await profileService.addDonationWithClerk(
        token as string,
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        donationData
      );

      // Update local state
      setDonationHistory(prev => [newDonation, ...prev]);

      // Update user profile with new donation count
      setUserProfile(prev => ({
        ...prev,
        totalDonations: (prev.totalDonations || 0) + 1,
        lastDonationDate: donationData.donationDate
      }));

      // Close the form
      setShowAddDonation(false);
    } catch (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  };

  // If user is not signed in and not authenticated through traditional auth, show the Clerk authentication UI
  if (!isSignedIn && !authService.isAuthenticated()) {
    return (
      <div className="auth-container">
        <h1>Please Sign In to Access Donor Dashboard</h1>
        <div className="clerk-auth-wrapper">
          <ClerkAuth mode="signin" />
        </div>
      </div>
    );
  }

  // If user is authenticated through traditional auth but not through Clerk
  // We still allow them to proceed with the dashboard

  // Show loading spinner while user data is being loaded
  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Show profile edit form
  if (showEditProfile) {
    return (
      <div className="donor-dashboard">
        <ProfileEditForm
          profile={userProfile}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditProfile(false)}
        />
      </div>
    );
  }

  // Show add donation form
  if (showAddDonation) {
    return (
      <div className="donor-dashboard">
        <AddDonationForm
          onSave={handleAddDonation}
          onCancel={() => setShowAddDonation(false)}
        />
      </div>
    );
  }

  return (
    <div className="donor-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {userProfile.fullName || 'Donor'}!</h1>
          <p className="next-donation">
            Next eligible donation date: <span className="highlight-date">{nextDonationDate}</span>
          </p>
          <button className="edit-profile-btn" onClick={() => setShowEditProfile(true)}>
            <FaEdit /> Edit Profile
          </button>
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
            <div className="stat-value">{userProfile.totalDonations || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blood-group-icon"><MdBloodtype />
          </div>
          <div className="stat-content">
            <div className="stat-label">Blood Group</div>
            <div className="stat-value">{userProfile.bloodGroup}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rewards-icon"><FaStar /></div>
          <div className="stat-content">
            <div className="stat-label">Reward Points</div>
            <div className="stat-value">{(userProfile.rewardPoints || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Donation History Section */}
          <DonationHistory
            donations={donationHistory}
            onAddDonation={() => setShowAddDonation(true)}
          />

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