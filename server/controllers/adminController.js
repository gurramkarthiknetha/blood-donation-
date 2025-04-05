import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import Hospital from '../models/hospital.js';
import Donor from '../models/donor.js';

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Simple response for now
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      role
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Simple mock data for now
    res.json({
      totalDonors: 0,
      totalHospitals: 0,
      bloodRequests: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

export const getHospitalStats = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, '-password').lean();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital stats', error });
  }
};

export const getDonorStats = async (req, res) => {
  try {
    const donorStats = await Donor.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 },
          totalDonations: { $sum: '$numberOfDonations' }
        }
      }
    ]);
    res.json(donorStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donor stats', error });
  }
};

export const getAllBloodRequests = async (req, res) => {
  try {
    const requests = await Hospital.aggregate([
      { $unwind: '$bloodRequests' },
      {
        $project: {
          hospitalName: '$name',
          hospitalId: '$_id',
          request: '$bloodRequests'
        }
      }
    ]);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood requests', error });
  }
};

export const approveBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { hospitalId } = req.body;
    
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const request = hospital.bloodRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'approved';
    await hospital.save();
    
    res.json({ message: 'Request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error });
  }
};

export const rejectBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { hospitalId, reason } = req.body;
    
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const request = hospital.bloodRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.rejectionReason = reason;
    await hospital.save();
    
    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error });
  }
};