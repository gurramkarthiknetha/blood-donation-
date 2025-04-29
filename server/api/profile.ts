import express, { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Donation from '../models/donation';
import { authenticateJWT, authenticateClerk, authorizeRole } from '../middleware/auth';

// Extend the Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

const router = express.Router();

// Get user profile - supports both JWT and Clerk authentication
router.route('/').get(async (req: Request, res: Response) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;

    if (clerkUserId && clerkUserEmail) {
      // Try to find user by Clerk ID or email
      let user = await User.findOne({
        $or: [
          { clerkId: clerkUserId },
          { email: clerkUserEmail }
        ]
      });

      // If user doesn't exist, create a new one with basic info
      if (!user) {
        user = new User({
          email: clerkUserEmail,
          clerkId: clerkUserId,
          role: 'donor',
          fullName: req.headers['clerk-user-name'] || 'Donor',
          phoneNumber: '0000000000', // Default value
          address: 'Not provided', // Default value
          bloodGroup: 'Unknown' // Default value
        });
        await user.save();
      }

      // Send user profile without sensitive information
      res.status(200).json({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        bloodGroup: user.bloodGroup,
        address: user.address
      });
      return;
    }

    // Fall back to JWT authentication
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Verify token and get user ID
    // This is a simplified version - in a real app, you'd use the authenticateJWT middleware
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Invalid authentication' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return user profile without sensitive information
    res.status(200).json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      bloodGroup: user.bloodGroup,
      address: user.address
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  }
});

// Update user profile
router.route('/').put(async (req: Request, res: Response) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;

    let userId;

    if (clerkUserId && clerkUserEmail) {
      // Try to find user by Clerk ID or email
      const user = await User.findOne({
        $or: [
          { clerkId: clerkUserId },
          { email: clerkUserEmail }
        ]
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      userId = user._id;
    } else {
      // Fall back to JWT authentication
      userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
    }

    const { fullName, phoneNumber, bloodGroup, address } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !address) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        phoneNumber,
        bloodGroup,
        address
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return updated user profile
    res.status(200).json({
      id: updatedUser._id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      bloodGroup: updatedUser.bloodGroup,
      address: updatedUser.address
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  }
});

// Get user donation history
router.route('/donations').get(async (req: Request, res: Response) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;

    let userId;

    if (clerkUserId && clerkUserEmail) {
      // Try to find user by Clerk ID or email
      const user = await User.findOne({
        $or: [
          { clerkId: clerkUserId },
          { email: clerkUserEmail }
        ]
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      userId = user._id;
    } else {
      // Fall back to JWT authentication
      userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
    }

    // Get donation history
    const donations = await Donation.find({ donorId: userId })
      .sort({ donationDate: -1 })
      .populate('hospitalId', 'fullName');

    // Return donation history
    res.status(200).json({
      donations: donations.map(donation => ({
        id: donation._id,
        bloodGroup: donation.bloodGroup,
        units: donation.units,
        donationDate: donation.donationDate,
        location: donation.location,
        hospital: donation.hospitalId ? (donation.hospitalId as any).fullName : 'Unknown',
        status: donation.status,
        certificateUrl: donation.certificateUrl
      }))
    });
  } catch (error) {
    console.error('Error fetching donation history:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to fetch donation history' });
    }
  }
});

// Add a new donation record
router.route('/donations').post(async (req: Request, res: Response) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;

    let userId;

    if (clerkUserId && clerkUserEmail) {
      // Try to find user by Clerk ID or email
      const user = await User.findOne({
        $or: [
          { clerkId: clerkUserId },
          { email: clerkUserEmail }
        ]
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      userId = user._id;
    } else {
      // Fall back to JWT authentication
      userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
    }

    const { bloodGroup, units, donationDate, location, hospitalId } = req.body;

    // Validate required fields
    if (!bloodGroup || !location) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Create new donation record
    const donation = new Donation({
      donorId: userId,
      bloodGroup,
      units: units || 1,
      donationDate: donationDate || new Date(),
      location,
      hospitalId,
      status: 'completed'
    });

    await donation.save();

    // Return new donation record
    res.status(201).json({
      id: donation._id,
      bloodGroup: donation.bloodGroup,
      units: donation.units,
      donationDate: donation.donationDate,
      location: donation.location,
      status: donation.status
    });
  } catch (error) {
    console.error('Error adding donation record:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to add donation record' });
    }
  }
});

export default router;
