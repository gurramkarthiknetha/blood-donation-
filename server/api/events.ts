import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Event from '../models/event';
import User from '../models/user';
import { authenticateJWT, authenticateClerk, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Get all upcoming events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find({ status: 'upcoming' })
      .sort({ date: 1 })
      .populate('organizer', 'fullName');

    // Format events for client
    const formattedEvents = events.map(event => ({
      id: event._id,
      name: event.name,
      location: event.location,
      date: event.date,
      timeRange: `${event.startTime} - ${event.endTime}`,
      slots: {
        remaining: event.capacity - event.registrations.filter((r: any) => r.status === 'registered').length,
        total: event.capacity
      },
      host: event.organizer ? (event.organizer as any).fullName : 'Unknown',
      status: getEventStatus(event)
    }));

    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Create a new event (hospital or admin only)
router.post('/', authenticateJWT, authorizeRole(['hospital', 'admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, location, date, startTime, endTime, capacity, bloodTypesNeeded } = req.body;

    // Validate required fields
    if (!name || !location || !date || !startTime || !endTime || !capacity || !bloodTypesNeeded) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    // Create new event
    const event = new Event({
      name,
      location,
      date,
      startTime,
      endTime,
      capacity,
      bloodTypesNeeded,
      organizer: new mongoose.Types.ObjectId(req.user?.userId),
      registrations: [],
      status: 'upcoming'
    });

    await event.save();

    res.status(201).json({
      id: event._id,
      name: event.name,
      location: event.location,
      date: event.date,
      timeRange: `${event.startTime} - ${event.endTime}`,
      capacity: event.capacity,
      bloodTypesNeeded: event.bloodTypesNeeded
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Register for an event (donor only)
router.post('/:eventId/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for Clerk authentication first
    const clerkUserId = req.headers['clerk-user-id'] as string;
    const clerkUserEmail = req.headers['clerk-user-email'] as string;
    const { bloodType } = req.body;

    if (!bloodType) {
      res.status(400).json({ message: 'Blood type is required' });
      return;
    }

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

    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check if event is upcoming
    if (event.status !== 'upcoming') {
      res.status(400).json({ message: 'Registration is closed for this event' });
      return;
    }

    // Check if capacity is reached
    const registeredCount = event.registrations.filter((r: any) => r.status === 'registered').length;
    if (registeredCount >= event.capacity) {
      res.status(400).json({ message: 'Event is fully booked' });
      return;
    }

    // Check if user is already registered
    const existingRegistration = event.registrations.find(
      (r: any) => r.donorId.toString() === userId?.toString() && r.status === 'registered'
    );

    if (existingRegistration) {
      res.status(400).json({ message: 'You are already registered for this event' });
      return;
    }

    // Add registration
    if (userId) {
      event.registrations.push({
        donorId: userId,
        bloodType,
        registrationDate: new Date(),
        status: 'registered'
      });
    } else {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    await event.save();

    res.status(200).json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

// Get user's registered events
router.get('/registered', async (req: Request, res: Response, next: NextFunction) => {
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

    // Find events where user is registered
    const events = await Event.find({
      'registrations.donorId': userId,
      'registrations.status': { $in: ['registered', 'attended'] }
    }).populate('organizer', 'fullName');

    // Format events for client
    const registrations = events.map(event => {
      const registration = event.registrations.find(
        (r: any) => r.donorId.toString() === userId?.toString()
      );

      return {
        eventId: event._id,
        campName: event.name,
        dateTime: `${new Date(event.date).toLocaleDateString()} • ${event.startTime}`,
        status: registration?.status === 'attended' ? 'Attended' : 'Registered',
        action: registration?.status === 'attended' ? 'View Certificate' : 'Cancel'
      };
    });

    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ message: 'Failed to fetch registered events' });
  }
});

// Cancel registration
router.post('/:eventId/cancel', async (req: Request, res: Response, next: NextFunction) => {
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

    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Find user's registration
    const registrationIndex = event.registrations.findIndex(
      (r: any) => r.donorId.toString() === userId?.toString() && r.status === 'registered'
    );

    if (registrationIndex === -1) {
      res.status(400).json({ message: 'You are not registered for this event' });
      return;
    }

    // Update registration status to cancelled
    event.registrations[registrationIndex].status = 'cancelled';
    await event.save();

    res.status(200).json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: 'Failed to cancel registration' });
  }
});

// Helper function to determine event status for client
function getEventStatus(event: any): 'Available' | 'Few Slots Left' | 'Fully Booked' {
  const registeredCount = event.registrations.filter((r: any) => r.status === 'registered').length;
  const remainingSlots = event.capacity - registeredCount;

  if (remainingSlots <= 0) {
    return 'Fully Booked';
  } else if (remainingSlots <= 5) {
    return 'Few Slots Left';
  } else {
    return 'Available';
  }
}

export default router;
