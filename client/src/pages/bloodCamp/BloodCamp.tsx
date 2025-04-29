import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHospital, FaSpinner } from 'react-icons/fa';
import './BloodCamp.css';
import { eventService, BloodDrive, Registration } from '../../services/eventService';
import { toastService } from '../../services/toastService';

const BloodCamp: React.FC = () => {
  const [upcomingCamps, setUpcomingCamps] = useState<BloodDrive[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [registering, setRegistering] = useState<boolean>(false);
  const [selectedBloodType, setSelectedBloodType] = useState<string>('');
  const [showBloodTypeModal, setShowBloodTypeModal] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch events and registrations
  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, registrationsData] = await Promise.all([
        eventService.getUpcomingEvents(),
        eventService.getUserRegistrations()
      ]);

      setUpcomingCamps(eventsData);
      setMyRegistrations(registrationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toastService.error('Failed to load blood donation camps');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (eventId: string) => {
    setSelectedEventId(eventId);
    setShowBloodTypeModal(true);
  };

  // Confirm registration with blood type
  const confirmRegistration = async () => {
    if (!selectedBloodType) {
      toastService.warning('Please select your blood type');
      return;
    }

    try {
      setRegistering(true);
      await eventService.registerForEvent(selectedEventId, selectedBloodType);
      toastService.success('Successfully registered for the blood donation camp');
      setShowBloodTypeModal(false);
      setSelectedBloodType('');
      fetchData(); // Refresh data
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Failed to register for the camp');
    } finally {
      setRegistering(false);
    }
  };

  // Handle cancellation
  const handleCancel = async (eventId: string) => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      try {
        await eventService.cancelRegistration(eventId);
        toastService.success('Registration cancelled successfully');
        fetchData(); // Refresh data
      } catch (error) {
        toastService.error('Failed to cancel registration');
      }
    }
  };

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

  // Filter camps based on search term and date
  const filteredCamps = upcomingCamps.filter(camp => {
    const matchesSearch = searchTerm === '' ||
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.host.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = filterDate === '' ||
      new Date(camp.date).toISOString().split('T')[0] === filterDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="blood-donation-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-bar">
          <FaMapMarkerAlt className="icon" />
          <input
            type="text"
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <input
            type="date"
            className="date-input"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button
            className="clear-filter-btn"
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading blood donation camps...</p>
        </div>
      ) : (
        <>
          {/* Upcoming Camps Section */}
          <section className="upcoming-camps-section">
            <h2>Upcoming Blood Donation Camps</h2>
            {filteredCamps.length > 0 ? (
              <div className="camps-grid">
                {filteredCamps.map((camp) => (
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
                      onClick={() => handleRegister(camp.id)}
                    >
                      {camp.status === 'Fully Booked' ? 'Fully Booked' : 'Register to Donate'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No blood donation camps found matching your criteria</p>
              </div>
            )}
          </section>

          {/* My Registrations Section */}
          <section className="my-registrations-section">
            <h2>My Camp Registrations</h2>
            {myRegistrations.length > 0 ? (
              <div className="registrations-table">
                <div className="table-header">
                  <div className="col camp-name">Camp Name</div>
                  <div className="col date-time">Date & Time</div>
                  <div className="col status">Status</div>
                  <div className="col actions">Actions</div>
                </div>
                {myRegistrations.map((registration) => (
                  <div key={registration.eventId} className="table-row">
                    <div className="col camp-name">{registration.campName}</div>
                    <div className="col date-time">{registration.dateTime}</div>
                    <div className="col status">
                      <span className={`status-badge ${getStatusClass(registration.status)}`}>
                        {registration.status}
                      </span>
                    </div>
                    <div className="col actions">
                      <button
                        className={`action-btn ${getActionClass(registration.action)}`}
                        onClick={() => registration.action === 'Cancel'
                          ? handleCancel(registration.eventId)
                          : window.alert('Certificate viewing is not yet implemented')}
                      >
                        {registration.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>You haven't registered for any blood donation camps yet</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Blood Type Selection Modal */}
      {showBloodTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select Your Blood Type</h3>
            <select
              value={selectedBloodType}
              onChange={(e) => setSelectedBloodType(e.target.value)}
              className="blood-type-select"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowBloodTypeModal(false);
                  setSelectedBloodType('');
                }}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={confirmRegistration}
                disabled={registering || !selectedBloodType}
              >
                {registering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodCamp;