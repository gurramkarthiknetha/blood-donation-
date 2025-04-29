import { api } from '../config/api';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  bgColor: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  available: boolean;
  category?: string;
  imageUrl?: string;
}

export interface DonationHistoryItem {
  id: number;
  type: string;
  date: string;
  points: number;
}

export interface RewardSummary {
  userPoints: number;
  totalDonations: number;
  currentLevel: number;
  pointsToNextLevel: number;
  badges: Badge[];
  donationHistory: DonationHistoryItem[];
  redemptions: any[];
}

class RewardService {
  // Get all available rewards
  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const response = await api.get('/api/rewards');
      return response.data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  }

  // Get user's reward summary (points, badges, etc.)
  async getUserRewardSummary(): Promise<RewardSummary> {
    try {
      const response = await api.get('/api/rewards/user-rewards');
      return response.data;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  }

  // Redeem a reward
  async redeemReward(rewardId: string, deliveryDetails?: any): Promise<any> {
    try {
      const response = await api.post(`/api/rewards/redeem/${rewardId}`, { deliveryDetails });
      return response.data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  }
}

export const rewardService = new RewardService();
export default rewardService;
