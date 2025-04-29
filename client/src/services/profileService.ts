import axios from 'axios';
import { api } from '../config/api';

// Define types for profile data
export interface UserProfile {
  id?: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber: string;
  bloodGroup: string;
  address: string;
  lastDonationDate?: string;
  totalDonations?: number;
  rewardPoints?: number;
}

export interface DonationRecord {
  id: string;
  bloodGroup: string;
  units: number;
  donationDate: string;
  location: string;
  hospital?: string;
  status: 'pending' | 'completed' | 'rejected';
  certificateUrl?: string;
}

class ProfileService {
  // Get user profile with Clerk authentication
  async getProfileWithClerk(clerkToken: string, userId: string, userEmail: string) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          'clerk-token': clerkToken,
          'clerk-user-id': userId,
          'clerk-user-email': userEmail
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile with Clerk:', error);
      throw error;
    }
  }

  // Update user profile with Clerk authentication
  async updateProfileWithClerk(
    clerkToken: string,
    userId: string,
    userEmail: string,
    profileData: Partial<UserProfile>
  ) {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/profile`,
        profileData,
        {
          headers: {
            'clerk-token': clerkToken,
            'clerk-user-id': userId,
            'clerk-user-email': userEmail
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating profile with Clerk:', error);
      throw error;
    }
  }

  // Get donation history with Clerk authentication
  async getDonationHistoryWithClerk(clerkToken: string, userId: string, userEmail: string) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile/donations`,
        {
          headers: {
            'clerk-token': clerkToken,
            'clerk-user-id': userId,
            'clerk-user-email': userEmail
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching donation history with Clerk:', error);
      throw error;
    }
  }

  // Add donation record with Clerk authentication
  async addDonationWithClerk(
    clerkToken: string,
    userId: string,
    userEmail: string,
    donationData: Partial<DonationRecord>
  ) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/donations`,
        donationData,
        {
          headers: {
            'clerk-token': clerkToken,
            'clerk-user-id': userId,
            'clerk-user-email': userEmail
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding donation with Clerk:', error);
      throw error;
    }
  }

  // Get user profile with JWT authentication
  async getProfile() {
    try {
      const response = await api.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Update user profile with JWT authentication
  async updateProfile(profileData: Partial<UserProfile>) {
    try {
      const response = await api.put('/api/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Get donation history with JWT authentication
  async getDonationHistory() {
    try {
      const response = await api.get('/api/profile/donations');
      return response.data;
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw error;
    }
  }

  // Add donation record with JWT authentication
  async addDonation(donationData: Partial<DonationRecord>) {
    try {
      const response = await api.post('/api/profile/donations', donationData);
      return response.data;
    } catch (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
