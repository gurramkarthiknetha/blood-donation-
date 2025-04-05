import React from 'react';

interface Event {
  _id: string;
  date: string;
  location: string;
  capacity: number;
  bloodTypesNeeded: string[];
  registeredDonors: Array<{
    donorId: string;
    bloodType: string;
    status: string;
  }>;
  status: string;
}

interface EventListProps {
  events: Event[];
  userRole: string;
  onRegister: (eventId: string, bloodType: string) => void;
  onCancel: (eventId: string, reason: string) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  userRole,
  onRegister,
  onCancel
}) => {
  const [selectedBloodType, setSelectedBloodType] = React.useState('');

  const handleRegister = (eventId: string) => {
    if (selectedBloodType) {
      onRegister(eventId, selectedBloodType);
      setSelectedBloodType('');
    }
  };

  const handleCancel = (eventId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      onCancel(eventId, reason);
    }
  };

  if (events.length === 0) {
    return (
      <div className="no-events">
        <p>No upcoming blood donation events</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event._id} className="event-card">
          <div className="event-header">
            <h4>{new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</h4>
            <span className={`status-badge ${event.status}`}>
              {event.status}
            </span>
          </div>

          <div className="event-details">
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Capacity:</strong> {event.registeredDonors.length}/{event.capacity}</p>
            <div className="blood-types">
              <strong>Blood Types Needed:</strong>
              <div className="blood-type-tags">
                {event.bloodTypesNeeded.map(type => (
                  <span key={type} className="blood-type-tag">{type}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="event-actions">
            {userRole === 'donor' && event.status === 'upcoming' && (
              <div className="registration-form">
                <select
                  className="form-select"
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                >
                  <option value="">Select Blood Type</option>
                  {event.bloodTypesNeeded.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRegister(event._id)}
                  disabled={!selectedBloodType || event.registeredDonors.length >= event.capacity}
                >
                  Register
                </button>
              </div>
            )}

            {userRole === 'hospital' && event.status === 'upcoming' && (
              <button
                className="btn btn-outline-danger"
                onClick={() => handleCancel(event._id)}
              >
                Cancel Event
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;