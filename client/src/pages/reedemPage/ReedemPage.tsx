import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RedeemPage.css';

// Single React Component for Blood Donation App
const ReedemPage: React.FC = () => {
  // Sample data
  const userPoints = 2450;
  const totalDonations = 9;
  const currentLevel = 5;
  const pointsToNextLevel = 550;
  
  const badges = [
    {
      id: 1,
      name: 'First Timer',
      description: 'First donation completed',
      icon: '🩸',
      achieved: true,
      bgColor: '#ffebe9'
    },
    {
      id: 2,
      name: 'Regular Hero',
      description: '5 donations in 6 months',
      icon: '⭐',
      achieved: true,
      bgColor: '#fff9e6'
    },
    {
      id: 3,
      name: 'Life Saver',
      description: 'Donate 10 times (8/10)',
      icon: '🏅',
      achieved: false,
      bgColor: '#e6fff0'
    },
    {
      id: 4,
      name: 'Elite Donor',
      description: 'Reach Level 10',
      icon: '❤️',
      achieved: false,
      bgColor: '#f0f0f0'
    }
  ];
  
  const rewards = [
    {
      id: 1,
      name: '$25 Amazon Gift Card',
      description: 'Digital voucher',
      points: 2500,
      available: true
    },
    {
      id: 2,
      name: 'Movie Tickets',
      description: '2 Premium tickets',
      points: 1800,
      available: true
    },
    {
      id: 3,
      name: 'Wellness Package',
      description: 'Spa day voucher',
      points: 3000,
      available: false
    }
  ];
  
  const donations = [
    {
      id: 1,
      type: 'Latest Donation',
      date: 'March 15, 2025',
      points: 250
    },
    {
      id: 2,
      type: 'Regular Donation',
      date: 'January 2, 2025',
      points: 250
    },
    {
      id: 3,
      type: 'Emergency Donation',
      date: 'December 10, 2024',
      points: 300
    }
  ];

  return (
    <div className="container py-4">
      {/* Points Summary Card */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <h2 className="text-danger">{userPoints.toLocaleString()}</h2>
                  <p className="text-muted">Total Points</p>
                </div>
                <div className="col-6 text-end">
                  <h2 className="text-success">{totalDonations}</h2>
                  <p className="text-muted">Total Donations</p>
                </div>
              </div>
              
              {/* Points Progress */}
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Level {currentLevel} 👑</span>
                  <span>{pointsToNextLevel} points to Level {currentLevel + 1}</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: '65%' }}
                    aria-valuenow={65}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badges Section */}
      <div className="mb-4">
        <h5 className="mb-3">Your Badges</h5>
        <div className="row g-3">
          {badges.map((badge) => (
            <div key={badge.id} className="col-md-3 col-6">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div 
                    className="badge-icon mb-2 mx-auto" 
                    style={{ 
                      backgroundColor: badge.bgColor, 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}
                  >
                    {badge.icon}
                  </div>
                  <h6 className="card-title">{badge.name}</h6>
                  <p className="card-text small text-muted">
                    {badge.description}
                  </p>
                
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Rewards Section */}
      <div className="mb-4">
        <h5 className="mb-3">Redeem Rewards</h5>
        <div className="row g-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="col-md-4">
              <div className="card h-100 px-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">{reward.name}</h6>
                      <p className="card-text text-muted small">{reward.description}</p>
                    </div>
                    <div>
                      <span className="badge" style={{
                          color: '#ff6b6b',
                          padding: '16px 32px',
                          fontSize: '24px',   
                          fontWeight: 'bold'  
                        }}>{reward.points} pts
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 p-3">
                  <button 
                    className={`btn btn-${userPoints >= reward.points ? 'danger' : 'secondary'} w-100`}
                    disabled={userPoints < reward.points}
                  >
                    {userPoints >= reward.points ? 'Redeem Now' : 'Not Enough Points'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Donation History */}
      <div>
        <h5 className="mb-3">Donation History</h5>
        <div className="card">
          <div className="card-body">
            {donations.map((donation) => (
              <div key={donation.id} className="donation-item d-flex justify-content-between align-items-center py-3 border-bottom">
                <div className="d-flex align-items-center">
                  <div className="donation-dot me-3">
                    <span className="dot bg-danger"></span>
                  </div>
                  <div>
                    <h6 className="mb-0">{donation.type}</h6>
                    <small className="text-muted">{donation.date}</small>
                  </div>
                </div>
                <div className="text-success">+{donation.points} points</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReedemPage;