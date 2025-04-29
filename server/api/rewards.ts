import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/user';
import Reward from '../models/reward';
import Redemption from '../models/redemption';
import Badge from '../models/badge';
import Donation from '../models/donation';
import { authenticateJWT, authenticateClerk, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Get all available rewards
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rewards = await Reward.find({ available: true });

    res.status(200).json(rewards.map(reward => ({
      id: reward._id,
      name: reward.name,
      description: reward.description,
      points: reward.pointsCost,
      available: reward.available,
      imageUrl: reward.imageUrl,
      category: reward.category
    })));
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ message: 'Failed to fetch rewards' });
  }
});

// Get user's reward points and badges
router.get('/user-rewards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;

    let userId: mongoose.Types.ObjectId | undefined;

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

      userId = user._id as mongoose.Types.ObjectId;
    } else {
      // Fall back to JWT authentication
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      userId = new mongoose.Types.ObjectId(req.user.userId);
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get user's donations
    const donations = await Donation.find({ donorId: userId, status: 'completed' });

    // Get all badges
    const allBadges = await Badge.find();

    // Calculate user level (1 level per 500 points)
    const userLevel = Math.floor((user.rewardPoints || 0) / 500) + 1;
    const pointsToNextLevel = 500 - ((user.rewardPoints || 0) % 500);

    // Determine which badges the user has earned
    const userBadges = allBadges.map(badge => {
      let achieved = false;

      switch (badge.criteria.type) {
        case 'donations':
          achieved = (user.totalDonations || 0) >= badge.criteria.threshold;
          break;
        case 'points':
          achieved = (user.rewardPoints || 0) >= badge.criteria.threshold;
          break;
        case 'level':
          achieved = userLevel >= badge.criteria.threshold;
          break;
        case 'streak':
          // Would need more data to calculate streaks
          achieved = false;
          break;
      }

      return {
        id: badge._id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        achieved,
        bgColor: badge.backgroundColor
      };
    });

    // Get donation history with points
    const donationHistory = donations.map(donation => ({
      id: donation._id,
      type: 'Regular Donation',
      date: donation.donationDate.toLocaleDateString(),
      points: 250 // Standard points per donation
    }));

    // Get user's redemptions
    const redemptions = await Redemption.find({ userId })
      .populate('rewardId')
      .sort({ redeemedAt: -1 });

    res.status(200).json({
      userPoints: user.rewardPoints || 0,
      totalDonations: user.totalDonations || 0,
      currentLevel: userLevel,
      pointsToNextLevel,
      badges: userBadges,
      donationHistory: donationHistory,
      redemptions: redemptions.map(r => ({
        id: r._id,
        rewardName: (r.rewardId as any).name,
        pointsSpent: r.pointsSpent,
        redeemedAt: r.redeemedAt,
        status: r.status
      }))
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({ message: 'Failed to fetch user rewards' });
  }
});

// Redeem a reward
router.post('/redeem/:rewardId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;

    let userId: mongoose.Types.ObjectId | undefined;

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

      userId = user._id as mongoose.Types.ObjectId;
    } else {
      // Fall back to JWT authentication
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      userId = new mongoose.Types.ObjectId(req.user.userId);
    }

    const rewardId = req.params.rewardId;
    const { deliveryDetails } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get reward
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      res.status(404).json({ message: 'Reward not found' });
      return;
    }

    // Check if reward is available
    if (!reward.available) {
      res.status(400).json({ message: 'This reward is not available' });
      return;
    }

    // Check if user has enough points
    if ((user.rewardPoints || 0) < reward.pointsCost) {
      res.status(400).json({ message: 'Not enough points to redeem this reward' });
      return;
    }

    // Create redemption record
    const redemption = new Redemption({
      userId,
      rewardId,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date(),
      status: 'pending',
      deliveryDetails
    });

    await redemption.save();

    // Deduct points from user
    user.rewardPoints = (user.rewardPoints || 0) - reward.pointsCost;
    await user.save();

    res.status(200).json({
      message: 'Reward redeemed successfully',
      redemption: {
        id: redemption._id,
        rewardName: reward.name,
        pointsSpent: redemption.pointsSpent,
        status: redemption.status
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ message: 'Failed to redeem reward' });
  }
});

// Admin: Create a new reward
router.post('/', authenticateJWT, authorizeRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, pointsCost, category, imageUrl, expiryDate } = req.body;

    if (!name || !description || !pointsCost) {
      res.status(400).json({ message: 'Name, description and pointsCost are required' });
      return;
    }

    const reward = new Reward({
      name,
      description,
      pointsCost,
      category: category || 'voucher',
      imageUrl,
      expiryDate,
      available: true
    });

    await reward.save();

    res.status(201).json({
      id: reward._id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ message: 'Failed to create reward' });
  }
});

// Admin: Create a new badge
router.post('/badges', authenticateJWT, authorizeRole(['admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, icon, criteriaType, criteriaThreshold, backgroundColor } = req.body;

    if (!name || !description || !icon || !criteriaType || !criteriaThreshold) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const badge = new Badge({
      name,
      description,
      icon,
      criteria: {
        type: criteriaType,
        threshold: criteriaThreshold
      },
      backgroundColor: backgroundColor || '#f0f0f0'
    });

    await badge.save();

    res.status(201).json({
      id: badge._id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      criteria: badge.criteria
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({ message: 'Failed to create badge' });
  }
});

export default router;
