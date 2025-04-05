import React from 'react';
import { MdBloodtype } from 'react-icons/md';
import { IoLocationSharp } from 'react-icons/io5';

function BloodCamp() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4"><MdBloodtype /> Blood Donation Camps</h2>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">City Hospital Camp</h5>
              <p className="card-text">
                <IoLocationSharp /> 123 Main Street, Downtown
              </p>
              <p>Date: March 15, 2024</p>
              <p>Time: 9:00 AM - 5:00 PM</p>
              <button className="btn btn-primary">Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BloodCamp;