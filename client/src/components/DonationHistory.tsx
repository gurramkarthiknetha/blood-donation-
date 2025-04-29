import React from 'react';
import { DonationRecord } from '../services/profileService';
import './DonationHistory.css';
import { FaCalendarAlt, FaHospital, FaDownload, FaPlus } from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';

interface DonationHistoryProps {
  donations: DonationRecord[];
  onAddDonation: () => void;
}

export const DonationHistory: React.FC<DonationHistoryProps> = ({ donations, onAddDonation }) => {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge class based on donation status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-badge completed';
      case 'pending':
        return 'status-badge pending';
      case 'rejected':
        return 'status-badge rejected';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="donation-history">
      <div className="donation-history-header">
        <h2>Donation History</h2>
        <button className="add-donation-btn" onClick={onAddDonation}>
          <FaPlus /> Add Donation
        </button>
      </div>

      {donations.length === 0 ? (
        <div className="no-donations">
          <p>You haven't recorded any donations yet.</p>
          <button className="record-first-btn" onClick={onAddDonation}>
            Record Your First Donation
          </button>
        </div>
      ) : (
        <div className="donations-list">
          {donations.map((donation) => (
            <div key={donation.id} className="donation-card">
              <div className="donation-header">
                <div className="donation-date">
                  <FaCalendarAlt className="icon" />
                  {formatDate(donation.donationDate)}
                </div>
                <div className={getStatusBadgeClass(donation.status)}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </div>
              </div>
              
              <div className="donation-details">
                <div className="donation-detail">
                  <MdBloodtype className="icon" />
                  <span>{donation.bloodGroup}</span>
                </div>
                <div className="donation-detail">
                  <span className="units-label">Units:</span>
                  <span>{donation.units}</span>
                </div>
                <div className="donation-detail">
                  <FaHospital className="icon" />
                  <span>{donation.location}</span>
                </div>
              </div>
              
              {donation.certificateUrl && (
                <div className="donation-certificate">
                  <a href={donation.certificateUrl} target="_blank" rel="noopener noreferrer">
                    <FaDownload className="icon" /> Download Certificate
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistory;
