import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import api from '../../config/api';
import { toastService } from '../../services/toastService';
import CreateEventForm from './CreateEventForm';
import EventList from './EventList';
import './BloodCamp.css';

interface DonationEvent {
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

const BloodCamp = () => {
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = authService.getUserRole();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/upcoming');
      setEvents(response.data);
    } catch (error: any) {
      toastService.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      await api.post('/events', eventData);
      toastService.success('Event created successfully');
      fetchEvents();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleRegister = async (eventId: string, bloodType: string) => {
    try {
      await api.post(`/events/${eventId}/register`, { bloodType });
      toastService.success('Successfully registered for the event');
      fetchEvents();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancel = async (eventId: string, reason: string) => {
    try {
      await api.post(`/events/${eventId}/cancel`, { reason });
      toastService.success('Event cancelled successfully');
      fetchEvents();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || 'Failed to cancel event');
    }
  };

  if (loading) {
    return (
      <div className="blood-camp-container loading">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="blood-camp-container">
      <h2>Blood Donation Camps</h2>
      
      {userRole === 'hospital' && (
        <div className="create-event-section">
          <CreateEventForm onSubmit={handleCreateEvent} />
        </div>
      )}

      <div className="events-section">
        <EventList 
          events={events}
          userRole={userRole || ''}
          onRegister={handleRegister}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default BloodCamp;