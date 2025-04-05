import { useState } from 'react';

interface CreateEventFormProps {
  onSubmit: (data: any) => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    capacity: 50,
    bloodTypesNeeded: [] as string[]
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      date: '',
      location: '',
      capacity: 50,
      bloodTypesNeeded: []
    });
  };

  const handleBloodTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      bloodTypesNeeded: prev.bloodTypesNeeded.includes(type)
        ? prev.bloodTypesNeeded.filter(t => t !== type)
        : [...prev.bloodTypesNeeded, type]
    }));
  };

  return (
    <div className="create-event-form">
      <h3>Create New Blood Donation Event</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Date</label>
          <input
            type="datetime-local"
            className="form-control"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            className="form-control"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            placeholder="Enter event location"
          />
        </div>

        <div className="form-group">
          <label>Capacity</label>
          <input
            type="number"
            className="form-control"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Blood Types Needed</label>
          <div className="blood-type-grid">
            {bloodTypes.map(type => (
              <button
                key={type}
                type="button"
                className={`blood-type-btn ${formData.bloodTypesNeeded.includes(type) ? 'active' : ''}`}
                onClick={() => handleBloodTypeToggle(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-danger w-100"
          disabled={formData.bloodTypesNeeded.length === 0}
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEventForm;