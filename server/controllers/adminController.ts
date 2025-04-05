import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin';
import Hospital from '../models/hospital';
import Donor from '../models/donors';
import { AdminLoginRequest, AdminCreateRequest } from '../types/admin';
import { 
  sendRequestApprovedNotification,
  sendRequestRejectedNotification
} from '../utils/notificationHelpers';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as AdminLoginRequest;
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body as AdminCreateRequest;
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

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalHospitals, totalDonors, bloodRequests] = await Promise.all([
      Hospital.countDocuments(),
      Donor.countDocuments(),
      Hospital.aggregate([
        { $unwind: '$bloodRequests' },
        {
          $group: {
            _id: '$bloodRequests.status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const requestStats = bloodRequests.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalHospitals,
      totalDonors,
      requestStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};

export const getHospitalStats = async (req: Request, res: Response) => {
  try {
    const hospitals = await Hospital.find({}, '-password').lean();
    const stats = hospitals.map(hospital => ({
      ...hospital,
      totalRequests: hospital.bloodRequests?.length || 0,
      currentInventory: hospital.bloodInventory?.reduce((acc, curr) => acc + curr.quantity, 0) || 0
    }));
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital stats', error });
  }
};

export const getDonorStats = async (req: Request, res: Response) => {
  try {
    const donorStats = await Donor.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
          totalDonations: { $sum: '$numberOfDonations' }
        }
      }
    ]);
    
    res.json(donorStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donor stats', error });
  }
};

export const getAllBloodRequests = async (req: Request, res: Response) => {
  try {
    const requests = await Hospital.aggregate([
      { $unwind: '$bloodRequests' },
      {
        $project: {
          hospitalName: '$name',
          hospitalId: '$_id',
          request: '$bloodRequests'
        }
      },
      { $sort: { 'request.requestDate': -1 } }
    ]);
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood requests', error });
  }
};

export const approveBloodRequest = async (req: Request, res: Response) => {
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

    request.status = 'fulfilled';
    request.fulfilledDate = new Date();
    await hospital.save();
    
    await sendRequestApprovedNotification(hospitalId, request);
    
    res.json({ message: 'Request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error });
  }
};

export const rejectBloodRequest = async (req: Request, res: Response) => {
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

    request.status = 'cancelled';
    request.cancellationReason = reason;
    await hospital.save();
    
    await sendRequestRejectedNotification(hospitalId, request, reason);
    
    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error });
  }
};

export const manageHospital = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const updates = req.body;
    
    const hospital = await Hospital.findByIdAndUpdate(hospitalId, updates, { new: true });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error managing hospital', error });
  }
};

export const manageDonor = async (req: Request, res: Response) => {
  try {
    const { donorId } = req.params;
    const updates = req.body;
    
    const donor = await Donor.findByIdAndUpdate(donorId, updates, { new: true });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error managing donor', error });
  }
};