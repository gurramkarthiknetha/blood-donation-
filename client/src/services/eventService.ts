import axios from 'axios';
import { api } from '../config/api';

export interface BloodDrive {
  id: string;
  name: string;
  location: string;
  date: string;
  timeRange: string;
  slots: {
    remaining: number;
    total: number;
  };
  host: string;
  status: 'Available' | 'Few Slots Left' | 'Fully Booked';
}

export interface Registration {
  eventId: string;
  campName: string;
  dateTime: string;
  status: 'Registered' | 'Attended';
  action: 'Cancel' | 'View Certificate';
}

class EventService {
  // Get all upcoming events
  async getUpcomingEvents(): Promise<BloodDrive[]> {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  // Register for an event
  async registerForEvent(eventId: string, bloodType: string): Promise<any> {
    try {
      const response = await api.post(`/api/events/${eventId}/register`, { bloodType });
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  // Get user's registered events
  async getUserRegistrations(): Promise<Registration[]> {
    try {
      const response = await api.get('/api/events/registered');
      return response.data;
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw error;
    }
  }

  // Cancel registration
  async cancelRegistration(eventId: string): Promise<any> {
    try {
      const response = await api.post(`/api/events/${eventId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling registration:', error);
      throw error;
    }
  }

  // Create a new event (for hospitals/admins)
  async createEvent(eventData: any): Promise<any> {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
export default eventService;
