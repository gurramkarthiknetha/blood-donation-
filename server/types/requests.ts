export interface RegisterHospitalRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  location: {
    coordinates: [number, number];
  };
  hospitalId: string;
  licenseNumber: string;
}

export interface BloodInventoryUpdateRequest {
  bloodType: string;
  quantity: number;
}

export interface BloodRequestCreate {
  hospitalId: string;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface DonorSearchRequest {
  bloodType: string;
  latitude: number;
  longitude: number;
  maxDistance?: number;
}