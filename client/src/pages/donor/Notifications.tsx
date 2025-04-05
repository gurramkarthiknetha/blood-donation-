import React from 'react';

const Notifications: React.FC = () => {
  return (
    <div className="card">
      <h3>Notifications</h3>
      <div className="notification emergency">
        <p><strong>Emergency Request</strong><br />Urgent need for O+ blood at Central Hospital</p>
        <button className="respond-btn">Respond Now</button>
      </div>
      <div className="notification upcoming">
        <p><strong>Upcoming Appointment</strong><br />March 15, 2025 at City Blood Bank</p>
      </div>
    </div>
  );
};

export default Notifications;
