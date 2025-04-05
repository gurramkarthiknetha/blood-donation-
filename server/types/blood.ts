export interface BloodInventory {
  bloodType: string;
  quantity: number;
  lastUpdated: Date;
}

export interface BloodRequest {
  hospitalId: string;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'fulfilled' | 'cancelled';
  requestDate: Date;
  fulfilledDate?: Date;
}