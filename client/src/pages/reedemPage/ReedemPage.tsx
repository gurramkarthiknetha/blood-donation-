import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RedeemPage.css';
import { rewardService } from '../../services/rewardService';
import { toastService } from '../../services/toastService';
import { FaSpinner } from 'react-icons/fa';

// Blood Donation App Rewards Component
const ReedemPage: React.FC = () => {
  // State for loading and UI
  const [loading, setLoading] = useState<boolean>(true);
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [deliveryDetails, setDeliveryDetails] = useState<string>('');

  // State for user rewards data
  const [userPoints, setUserPoints] = useState<number>(0);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [pointsToNextLevel, setPointsToNextLevel] = useState<number>(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch rewards and user data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsData, userRewardsData] = await Promise.all([
        rewardService.getAvailableRewards(),
        rewardService.getUserRewardSummary()
      ]);

      setRewards(rewardsData);

      // Set user rewards data
      setUserPoints(userRewardsData.userPoints);
      setTotalDonations(userRewardsData.totalDonations);
      setCurrentLevel(userRewardsData.currentLevel);
      setPointsToNextLevel(userRewardsData.pointsToNextLevel);
      setBadges(userRewardsData.badges);
      setDonations(userRewardsData.donationHistory);
      setRedemptions(userRewardsData.redemptions);
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      toastService.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  // Handle reward redemption
  const handleRedeem = async (reward: any) => {
    setSelectedReward(reward);
    setShowConfirmation(true);
  };

  // Confirm redemption
  const confirmRedemption = async () => {
    if (!selectedReward) return;

    try {
      setRedeeming(true);
      await rewardService.redeemReward(selectedReward.id.toString(), {
        address: deliveryDetails
      });

      toastService.success('Reward redeemed successfully!');
      setShowConfirmation(false);
      setSelectedReward(null);
      setDeliveryDetails('');

      // Refresh data
      fetchData();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="container py-4">
      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="fa-spin mb-3" style={{ fontSize: '2rem', color: '#dc3545' }} />
          <p>Loading rewards data...</p>
        </div>
      ) : (
        <>
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
                        style={{ width: `${(500 - pointsToNextLevel) / 5}%` }}
                        aria-valuenow={(500 - pointsToNextLevel) / 5}
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
                  <div className={`card h-100 ${!badge.achieved ? 'opacity-50' : ''}`}>
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
                      {!badge.achieved && (
                        <span className="badge bg-secondary">Not Achieved</span>
                      )}
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
                        className={`btn btn-${userPoints >= reward.points && reward.available ? 'danger' : 'secondary'} w-100`}
                        disabled={userPoints < reward.points || !reward.available}
                        onClick={() => handleRedeem(reward)}
                      >
                        {!reward.available ? 'Not Available' :
                          userPoints >= reward.points ? 'Redeem Now' : 'Not Enough Points'}
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
                {donations.length > 0 ? (
                  donations.map((donation) => (
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
                  ))
                ) : (
                  <p className="text-center py-3">No donation history found</p>
                )}
              </div>
            </div>
          </div>

          {/* Redemption History */}
          {redemptions.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3">Redemption History</h5>
              <div className="card">
                <div className="card-body">
                  {redemptions.map((redemption) => (
                    <div key={redemption.id} className="donation-item d-flex justify-content-between align-items-center py-3 border-bottom">
                      <div className="d-flex align-items-center">
                        <div className="donation-dot me-3">
                          <span className="dot bg-primary"></span>
                        </div>
                        <div>
                          <h6 className="mb-0">{redemption.rewardName}</h6>
                          <small className="text-muted">
                            {new Date(redemption.redeemedAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="text-danger me-3">-{redemption.pointsSpent} points</span>
                        <span className={`badge bg-${
                          redemption.status === 'fulfilled' ? 'success' :
                          redemption.status === 'cancelled' ? 'danger' : 'warning'
                        }`}>
                          {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedReward && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Redemption</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedReward(null);
                    setDeliveryDetails('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>You are about to redeem <strong>{selectedReward.name}</strong> for <strong>{selectedReward.points} points</strong>.</p>
                <div className="mb-3">
                  <label htmlFor="deliveryDetails" className="form-label">Delivery Details</label>
                  <textarea
                    className="form-control"
                    id="deliveryDetails"
                    rows={3}
                    placeholder="Enter your address or any other delivery information"
                    value={deliveryDetails}
                    onChange={(e) => setDeliveryDetails(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedReward(null);
                    setDeliveryDetails('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={redeeming}
                  onClick={confirmRedemption}
                >
                  {redeeming ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Redeeming...
                    </>
                  ) : (
                    'Confirm Redemption'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReedemPage;