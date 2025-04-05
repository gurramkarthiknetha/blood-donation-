import { useState } from 'react';

interface BloodRequestFormProps {
  onSubmit: (data: { bloodType: string; quantity: number; urgency: string }) => void;
}

const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    bloodType: '',
    quantity: 1,
    urgency: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3>Request Blood</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Blood Type</label>
          <select
            className="form-select"
            value={formData.bloodType}
            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            required
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
        </div>

        <div className="mb-3">
          <label className="form-label">Quantity (Units)</label>
          <input
            type="number"
            className="form-control"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label d-block">Urgency Level</label>
          <div className="btn-group">
            {['normal', 'urgent', 'emergency'].map((level) => (
              <button
                key={level}
                type="button"
                className={`urgency-btn ${formData.urgency === level ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, urgency: level })}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-danger submit-btn">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default BloodRequestForm;