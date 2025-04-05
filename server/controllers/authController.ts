import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Hospital from '../models/hospital';
import Donor from '../models/donors';
import Admin from '../models/admin';
import { generateToken } from '../services/authService';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    let user;
    
    switch (role) {
      case 'hospital':
        user = await Hospital.findOne({ email });
        break;
      case 'donor':
        user = await Donor.findOne({ email });
        break;
      case 'admin':
        user = await Admin.findOne({ email });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role,
        ...(role === 'hospital' && { hospitalId: user._id }),
        ...(role === 'donor' && { donorId: user._id })
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Remove sensitive data before sending
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      role,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { role, password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    switch (role) {
      case 'hospital':
        user = new Hospital({ ...userData, password: hashedPassword });
        break;
      case 'donor':
        user = new Donor({ ...userData, password: hashedPassword });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error during registration', error });
  }
};

export const registerDonor = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, bloodGroup, phoneNumber, address } = req.body;

    const donor = new Donor({
      email,
      password,
      fullName,
      bloodGroup,
      phoneNumber,
      address,
      points: 0
    });

    await donor.save();
    res.status(201).json({ message: 'Donor registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering donor', error });
  }
};

export const registerHospital = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phoneNumber, address } = req.body;

    const hospital = new Hospital({
      email,
      password,
      name: fullName,
      phoneNumber,
      address,
      bloodInventory: {}
    });

    await hospital.save();
    res.status(201).json({ message: 'Hospital registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering hospital', error });
  }
};