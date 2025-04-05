import React from 'react';
import { MdOutlineDateRange } from "react-icons/md";

const BookAppointment: React.FC = () => {
  return (
    <div className="card">
      <h3>Book Appointment</h3>
      <input type="date" className="input-field" />
      <select className="input-field">
        <option>Select Blood Bank</option>
        <option>City Blood Bank</option>
        <option>Central Hospital</option>
      </select>
      <button className="book-btn">Book Appointment</button>
    </div>
  );
};

export default BookAppointment;
