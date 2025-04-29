import React, { useState, useEffect } from 'react';
import './Reciever.css';
import { apiService } from '../../services/apiService';
import { toastService } from '../../services/toastService';
import { wsService } from '../../services/websocketService';

interface BloodRequest {
  _id: string;
  bloodType: string;
  quantity: number;
  requestedOn: string;
  status: string;
  urgency: string;
}

interface ReceiverStats {
  totalRequests: number;
  unitsReceived: number;
}

const Reciever: React.FC = () => {
  // Form state
  const [requesterType, setRequesterType] = useState<'hospital' | 'individual'>('hospital');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [unitsRequired, setUnitsRequired] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [markAsEmergency, setMarkAsEmergency] = useState<boolean>(false);

  // Individual user fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');

  // Hospital fields
  const [password, setPassword] = useState<string>('');

  // Data state
  const [stats, setStats] = useState<ReceiverStats>({
    totalRequests: 0,
    unitsReceived: 0
  });
  const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Load initial data
    fetchDashboardData();

    // Cleanup WebSocket connection when component unmounts
    return () => {
      wsService.disconnect();
    };
  }, []);

  // Fetch dashboard data from static backend endpoints
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Use static endpoints to fetch blood requests
      const statsResponse = await apiService.getBloodRequests();
      const requestsResponse = await apiService.getBloodRequests();

      // Process data from static endpoints
      setStats({
        totalRequests: statsResponse.data.length || 0,
        unitsReceived: statsResponse.data.reduce((total: number, req: any) =>
          total + (req.status === 'fulfilled' ? req.quantity : 0), 0) || 0
      });

      // Transform data from static endpoints
      setRecentRequests(requestsResponse.data.map((req: any) => ({
        _id: req._id,
        bloodType: req.bloodType,
        quantity: req.quantity,
        requestedOn: new Date(req.createdAt).toLocaleDateString(),
        status: req.status,
        urgency: req.urgency
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toastService.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission using static backend endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for static endpoint
      const requestData = {
        requesterType,
        bloodType: bloodGroup,
        urgency: urgencyLevel.toLowerCase(),
        quantity: parseInt(unitsRequired),
        reason,
        isEmergency: markAsEmergency,
        // Include other fields based on requester type
        ...(requesterType === 'individual' ? {
          patientName: name,
          patientPhone: phone,
          patientAge: parseInt(age),
          patientDistrict: district,
          hospitalName: hospital
        } : {})
      };

      // Submit request using static endpoint
      await apiService.createBloodRequest(requestData);
      toastService.success('Blood request submitted successfully');

      // Reset form
      setBloodGroup('');
      setUnitsRequired('');
      setReason('');
      setMarkAsEmergency(false);

      if (requesterType === 'individual') {
        setName('');
        setPhone('');
        setAge('');
        setDistrict('');
        setHospital('');
      } else {
        setPassword('');
      }

      // Refresh data
      fetchDashboardData();

    } catch (error) {
      console.error('Error submitting blood request:', error);
      toastService.error('Failed to submit blood request');
    }
  };

  // WebSocket event handlers for static backend events
  useEffect(() => {
    // Listen for blood request updates from static backend events
    const handleRequestUpdate = (data: any) => {
      // Refresh data from static endpoints when an update is received
      fetchDashboardData();
    };

    // Register handler for static event
    wsService.on('blood_request_update', handleRequestUpdate);

    // Cleanup handler when component unmounts
    return () => {
      wsService.off('blood_request_update', handleRequestUpdate);
    };
  }, []);

  return (
    <div className="blood-donation-app">
      <div className="header">
        <h2>Welcome Request Blood, may a good soul sees your request.</h2>
      </div>

      {isLoading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <p>Total Requests</p>
                <h2>{stats.totalRequests}</h2>
              </div>
              <div className="icon">
                <i className="bi bi-clipboard-plus"></i>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <p>Units Received</p>
                <h2>{stats.unitsReceived}</h2>
              </div>
              <div className="icon">
                <i className="bi bi-droplet-fill"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-container">
        <div className="form-header">
          <h3>Request Blood</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-tabs mb-3">
            <button
              type="button"
              className={`btn ${requesterType === 'hospital' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setRequesterType('hospital')}
            >
              Hospital
            </button>
            <button
              type="button"
              className={`btn ms-2 ${requesterType === 'individual' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setRequesterType('individual')}
            >
              Individual User
            </button>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="bloodGroup" className="form-label">Blood Group</label>
              <select
                id="bloodGroup"
                className="form-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="unitsRequired" className="form-label">Units Required</label>
              <input
                type="number"
                className="form-control"
                id="unitsRequired"
                placeholder="Enter units"
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(e.target.value)}
              />
            </div>
          </div>

          {requesterType === 'individual' && (
            <>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="age" className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="district" className="form-label">District</label>
                  <input
                    type="text"
                    className="form-control"
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="hospital" className="form-label">Hospital</label>
                  <input
                    type="text"
                    className="form-control"
                    id="hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {requesterType === 'hospital' && (
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Urgency Level</label>
            <div className="d-flex">
              <div
                className={`urgency-btn ${urgencyLevel === 'Low' ? 'active' : ''}`}
                onClick={() => setUrgencyLevel('Low')}
              >
                Low
              </div>
              <div
                className={`urgency-btn ${urgencyLevel === 'Medium' ? 'active' : ''}`}
                onClick={() => setUrgencyLevel('Medium')}
              >
                Medium
              </div>
              <div
                className={`urgency-btn ${urgencyLevel === 'High' ? 'active' : ''}`}
                onClick={() => setUrgencyLevel('High')}
              >
                High
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="reason" className="form-label">Reason</label>
            <textarea
              className="form-control"
              id="reason"
              rows={3}
              placeholder="Describe the reason for request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button type="submit" className="btn btn-danger submit-btn">Submit Request</button>
            <div className="form-check emergency-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="markAsEmergency"
                checked={markAsEmergency}
                onChange={() => setMarkAsEmergency(!markAsEmergency)}
              />
              <label className="form-check-label" htmlFor="markAsEmergency">
                Mark as Emergency
              </label>
            </div>
          </div>
        </form>
      </div>

      <div className="recent-requests">
        <h3>Recent Requests</h3>

        {recentRequests.length > 0 ? (
          recentRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-details">
                <p className="request-id">Request #{request._id.substring(0, 6)}</p>
                <p className="blood-info">{request.bloodType} Blood Type • {request.quantity} Units</p>
                <p className="request-date">Requested on {request.requestedOn}</p>
              </div>
              <div className="request-status">
                <span className={`status-badge ${request.status.replace(' ', '-').toLowerCase()}`}>
                  {request.status}
                </span>
                <p className="view-details">View Details</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-requests">
            <p>No recent requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reciever;