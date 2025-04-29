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
  FaEdit
} from 'react-icons/fa';
import { BiSolidDonateBlood } from "react-icons/bi";
import { MdBloodtype } from "react-icons/md";
import { FaStar } from "react-icons/fa6";
import { FaRobot } from "react-icons/fa";
import { useAuth, useUser, useSession } from '@clerk/clerk-react';
import { ClerkAuth } from '../../components/ClerkAuth';
import { profileService, UserProfile, DonationRecord } from '../../services/profileService';
import { authService } from '../../services/authService';
import { wsService } from '../../services/websocketService';
import { toastService } from '../../services/toastService';
import { apiService } from '../../services/apiService';
import ProfileEditForm from '../../components/ProfileEditForm';
import DonationHistory from '../../components/DonationHistory';
import AddDonationForm from '../../components/AddDonationForm';
import './Donor.css';

const DonorDashboard: React.FC = () => {
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [availableBloodBanks, setAvailableBloodBanks] = useState<any[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedBloodBank, setSelectedBloodBank] = useState('');

  // Connect to WebSocket and load initial data
  useEffect(() => {
    if (isSignedIn || authService.isAuthenticated()) {
      wsService.connect();

      // Listen for donation-related events
      wsService.on('donation_update', (data: any) => {
        toastService.info('New donation information received');
        fetchUserData();
      });

      wsService.on('emergency_request', (data: any) => {
        toastService.info(`Emergency blood request: ${data.bloodType} needed at ${data.hospital}`);
        // Add to notifications
        setNotifications(prev => [
          {
            type: 'emergency',
            title: 'Emergency Request',
            message: `Urgent need for ${data.bloodType} blood at ${data.hospital}`,
            date: new Date().toISOString()
          },
          ...prev
        ]);
      });

      // Load initial data
      fetchUserData();
      fetchBloodBanks();

      return () => {
        wsService.disconnect();
      };
    }
  }, [isSignedIn, isLoaded, user, session]);

  // Function to fetch user data from static backend endpoints
  const fetchUserData = async () => {
    if (isLoaded && user) {
      try {
        setLoading(true);

        // Get session token for API authentication
        const token = session ? await session.getToken() : 'no-token';

        // Fetch user profile from backend using static endpoint
        const profileData = await profileService.getProfileWithClerk(
          token as string,
          user.id,
          user.primaryEmailAddress?.emailAddress || ''
        );

        // Fetch donation history using static endpoint
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

        // Fetch appointments
        try {
          // This would be a real API call in a production app
          // const appointmentsResponse = await apiService.getDonorAppointments();
          // setUpcomingAppointments(appointmentsResponse.data);

          // Mock data for now
          setUpcomingAppointments([
            {
              id: '1',
              date: 'May 15, 2025',
              location: 'BBR Blood Bank',
              status: 'confirmed'
            }
          ]);

          // Mock notifications
          setNotifications([
            {
              type: 'emergency',
              title: 'Emergency Request',
              message: 'Urgent need for O+ blood at Apollo Hospital',
              date: new Date().toISOString()
            },
            {
              type: 'appointment',
              title: 'Upcoming Appointment',
              message: 'May 15, 2025 at BBR Blood Bank',
              date: new Date().toISOString()
            }
          ]);
        } catch (error) {
          console.error('Error fetching appointments:', error);
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

  // Fetch blood banks
  const fetchBloodBanks = async () => {
    try {
      // This would be a real API call in a production app
      // const response = await apiService.getBloodBanks();
      // setAvailableBloodBanks(response.data);

      // Mock data for now
      setAvailableBloodBanks([
        { id: '1', name: 'City Blood Bank' },
        { id: '2', name: 'Apollo Blood Bank' },
        { id: '3', name: 'Red Cross Blood Center' }
      ]);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
    }
  };

  // Handle profile save using static backend endpoint
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      if (!user || !session) return;

      const token = await session.getToken();

      // Update profile in backend using static endpoint
      await profileService.updateProfileWithClerk(
        token as string,
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        updatedProfile
      );

      // Update local state
      setUserProfile(updatedProfile);
      setShowEditProfile(false);
      toastService.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toastService.error('Failed to update profile');
      throw error;
    }
  };

  // Handle adding a new donation using static backend endpoint
  const handleAddDonation = async (donationData: Partial<DonationRecord>) => {
    try {
      if (!user || !session) return;

      const token = await session.getToken();

      // Add donation in backend using static endpoint
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
      toastService.success('Donation record added successfully');
    } catch (error) {
      console.error('Error adding donation:', error);
      toastService.error('Failed to add donation record');
      throw error;
    }
  };

  // Handle booking appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentDate || !selectedBloodBank) {
      toastService.warning('Please select a date and blood bank');
      return;
    }

    try {
      // This would be a real API call in a production app
      // await apiService.bookAppointment({
      //   date: appointmentDate,
      //   bloodBankId: selectedBloodBank
      // });

      // Mock success
      toastService.success('Appointment booked successfully');

      // Reset form
      setAppointmentDate('');
      setSelectedBloodBank('');

      // Add to upcoming appointments
      const selectedBank = availableBloodBanks.find(bank => bank.id === selectedBloodBank);
      setUpcomingAppointments(prev => [
        {
          id: Date.now().toString(),
          date: new Date(appointmentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          location: selectedBank?.name || 'Blood Bank',
          status: 'pending'
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toastService.error('Failed to book appointment');
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
          <div className="stat-icon donation-icon"><BiSolidDonateBlood /></div>
          <div className="stat-content">
            <div className="stat-label">Total Donations</div>
            <div className="stat-value">{userProfile.totalDonations || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blood-group-icon"><MdBloodtype /></div>
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
              <form onSubmit={handleBookAppointment}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date"
                      placeholder="mm/dd/yyyy"
                      className="text-input"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="select-with-icon">
                    <FaHospital className="input-icon" />
                    <select
                      className="select-input"
                      value={selectedBloodBank}
                      onChange={(e) => setSelectedBloodBank(e.target.value)}
                      required
                    >
                      <option value="">Select Blood Bank</option>
                      {availableBloodBanks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="primary-btn full-width">Book Appointment</button>
              </form>
            </div>
          </div>

          <div className="section-card">
            <h2>Notifications</h2>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                      {notification.type === 'emergency' ? <FaBell /> : <FaCalendarCheck />}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      {notification.type === 'emergency' && (
                        <button className="respond-btn">Respond Now</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No notifications at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
