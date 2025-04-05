import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Donor from '../models/donors';

export const registerDonor = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, ...donorData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const donor = new Donor({
      ...donorData,
      fullName,
      email,
      password: hashedPassword
    });

    await donor.save();
    res.status(201).json({ message: 'Donor registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering donor', error });
  }
};

export const loginDonor = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email });
    
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const validPassword = await bcrypt.compare(password, donor.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: donor._id }, process.env.JWT_SECRET || 'secret');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const updateDonorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const donor = await Donor.findByIdAndUpdate(id, updates, { new: true });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating donor', error });
  }
};

export const recordDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donor = await Donor.findById(id);
    
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.numberOfDonations += 1;
    donor.lastDonationDate = new Date();
    donor.points += 100;
    
    assignBadges(donor);
    await donor.save();

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error recording donation', error });
  }
};

export const getDonorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donor = await Donor.findById(id);
    
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donor profile', error });
  }
};

const assignBadges = (donor: any) => {
  const n = donor.numberOfDonations;
  const badges = [];
  
  if (n >= 1) badges.push("First-Time Donor");
  if (n >= 3) badges.push("Bronze Donor");
  if (n >= 5) badges.push("Silver Donor");
  if (n >= 10) badges.push("Gold Donor");
  if (n >= 20) badges.push("Blood Hero");
  
  donor.badges = [...new Set(badges)];
};