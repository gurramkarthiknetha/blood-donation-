import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHospital } from 'react-icons/fa';
import './BloodCamp.css';

interface BloodDrive {
  id: string;
  name: string;
  location: string;
  date: string;
  timeRange: string;
  slots: {
    remaining: number;
    total: number;
  };
  host: string;
  status: 'Available' | 'Few Slots Left' | 'Fully Booked';
}

interface Registration {
  campName: string;
  dateTime: string;
  status: 'Registered' | 'Attended';
  action: 'Cancel' | 'View Certificate';
}

const BloodCamp: React.FC = () => {
  // Sample data for blood drives
  const upcomingCamps: BloodDrive[] = [
    {
      id: '1',
      name: 'RedDrop Blood Drive – City Mall',
      location: '123 City Mall, Downtown',
      date: 'April 25, 2025',
      timeRange: '9:00 AM - 5:00 PM',
      slots: {
        remaining: 45,
        total: 80
      },
      host: 'City Blood Bank',
      status: 'Available'
    },
    {
      id: '2',
      name: 'Community Blood Drive-park',
      location: 'Central Park Community Center',
      date: 'May 2, 2025',
      timeRange: '10:00 AM - 4:00 PM',
      slots: {
        remaining: 5,
        total: 50
      },
      host: 'Red Cross',
      status: 'Few Slots Left'
    },
    {
      id: '3',
      name: 'University Blood Drive',
      location: 'State University Campus',
      date: 'May 10, 2025',
      timeRange: '9:00 AM - 3:00 PM',
      slots: {
        remaining: 0,
        total: 60
      },
      host: 'University Health Center',
      status: 'Fully Booked'
    }
  ];

  // Sample data for registrations
  const myRegistrations: Registration[] = [
    {
      campName: 'RedDrop Blood Drive',
      dateTime: 'April 25, 2025 • 10:30 AM',
      status: 'Registered',
      action: 'Cancel'
    },
    {
      campName: 'Downtown Medical Center',
      dateTime: 'March 15, 2025 • 2:00 PM',
      status: 'Attended',
      action: 'View Certificate'
    }
  ];

  const getStatusClass = (status: string): string => {
    if (status === 'Available') return 'status-available';
    if (status === 'Few Slots Left') return 'status-few-slots';
    if (status === 'Fully Booked') return 'status-booked';
    if (status === 'Registered') return 'status-registered';
    if (status === 'Attended') return 'status-attended';
    return '';
  };

  const getActionClass = (action: string): string => {
    if (action === 'Cancel') return 'action-cancel';
    return '';
  };

  return (
    <div className="blood-donation-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-bar">
          <FaMapMarkerAlt className="icon" />
          <input type="text" placeholder="Search by city or location" />
        </div>
        <div className="filter-options">
          <input type="text" placeholder="mm/dd/yyyy" className="date-input" />
          <select className="blood-group-select">
            <option>All Blood Groups</option>
          </select>
          <button className="map-view-btn">
            <span className="map-icon">⬚</span> Map View
          </button>
        </div>
      </div>

      {/* Upcoming Camps Section */}
      <section className="upcoming-camps-section">
        <h2>Upcoming Blood Donation Camps</h2>
        <div className="camps-grid">
          {upcomingCamps.map((camp) => (
            <div key={camp.id} className="camp-card">
              <div className="camp-header">
                <h3>{camp.name}</h3>
                <span className={`status-badge ${getStatusClass(camp.status)}`}>
                  {camp.status}
                </span>
              </div>
              <div className="camp-details">
                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>{camp.location}</span>
                </div>
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{camp.date} • {camp.timeRange}</span>
                </div>
                <div className="detail-item">
                  <FaUsers className="detail-icon" />
                  <span>
                    {camp.slots.remaining}/{camp.slots.total} slots remaining
                  </span>
                </div>
                <div className="detail-item">
                  <FaHospital className="detail-icon" />
                  <span>Hosted by: {camp.host}</span>
                </div>
              </div>
              <button 
                className="register-button"
                disabled={camp.status === 'Fully Booked'}
              >
                {camp.status === 'Fully Booked' ? 'Fully Booked' : 'Register to Donate'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* My Registrations Section */}
      <section className="my-registrations-section">
        <h2>My Camp Registrations</h2>
        <div className="registrations-table">
          <div className="table-header">
            <div className="col camp-name">Camp Name</div>
            <div className="col date-time">Date & Time</div>
            <div className="col status">Status</div>
            <div className="col actions">Actions</div>
          </div>
          {myRegistrations.map((registration, index) => (
            <div key={index} className="table-row">
              <div className="col camp-name">{registration.campName}</div>
              <div className="col date-time">{registration.dateTime}</div>
              <div className="col status">
                <span className={`status-badge ${getStatusClass(registration.status)}`}>
                  {registration.status}
                </span>
              </div>
              <div className="col actions">
                <button className={`action-btn ${getActionClass(registration.action)}`}>
                  {registration.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BloodCamp;