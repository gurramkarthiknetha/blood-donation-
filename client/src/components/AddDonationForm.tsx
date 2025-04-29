import React, { useState } from 'react';
import { DonationRecord } from '../services/profileService';
import './AddDonationForm.css';
import { FaTimes } from 'react-icons/fa';

interface AddDonationFormProps {
  onSave: (donationData: Partial<DonationRecord>) => Promise<void>;
  onCancel: () => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const AddDonationForm: React.FC<AddDonationFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<DonationRecord>>({
    bloodGroup: '',
    units: 1,
    donationDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    location: '',
    status: 'completed'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units' ? parseInt(value, 10) : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.donationDate) {
      newErrors.donationDate = 'Donation date is required';
    } else {
      const donationDate = new Date(formData.donationDate);
      const today = new Date();
      
      if (donationDate > today) {
        newErrors.donationDate = 'Donation date cannot be in the future';
      }
    }
    
    if (!formData.units || formData.units < 1) {
      newErrors.units = 'At least 1 unit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving donation:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save donation. Please try again.'
      }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-donation-form">
      <div className="form-header">
        <h2>Record New Donation</h2>
        <button className="close-btn" onClick={onCancel}>
          <FaTimes />
        </button>
      </div>
      
      {errors.form && <div className="error-message">{errors.form}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="donationDate">Donation Date</label>
          <input
            type="date"
            id="donationDate"
            name="donationDate"
            value={formData.donationDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Limit to today
            className={errors.donationDate ? 'error' : ''}
          />
          {errors.donationDate && <div className="error-text">{errors.donationDate}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group</label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className={errors.bloodGroup ? 'error' : ''}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.bloodGroup && <div className="error-text">{errors.bloodGroup}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="units">Units Donated</label>
          <input
            type="number"
            id="units"
            name="units"
            min="1"
            max="5"
            value={formData.units}
            onChange={handleChange}
            className={errors.units ? 'error' : ''}
          />
          {errors.units && <div className="error-text">{errors.units}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Donation Location</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Hospital or blood bank name"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <div className="error-text">{errors.location}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Donation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDonationForm;
