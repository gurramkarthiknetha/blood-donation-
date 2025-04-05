export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminCreateRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'moderator';
}

export interface BloodDemandRequest {
  hospitalId: string;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}