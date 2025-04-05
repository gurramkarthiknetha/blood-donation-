import React from 'react';

interface BloodRequest {
  id: string;
  bloodType: string;
  quantity: number;
  status: string;
  createdAt: string;
}

interface RequestHistoryProps {
  requests: BloodRequest[];
}

const RequestHistory: React.FC<RequestHistoryProps> = ({ requests }) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="request-history">
      <h3 className="mb-3">Request History</h3>
      <div className="request-list">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-details">
              <p className="request-id">Request #{request.id}</p>
              <p className="blood-info">
                {request.quantity} units of {request.bloodType}
              </p>
              <p className="request-date">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="request-status">
              <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                {request.status}
              </span>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="no-requests text-center p-4">
            <p className="text-muted">No requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestHistory;