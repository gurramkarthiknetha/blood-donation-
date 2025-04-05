import { Request, Response } from 'express';
import DonationEvent from '../models/donationEvent';
import Donor from '../models/donors';

export const getAvailableEvents = async (req: Request, res: Response) => {
  try {
    const donor = await Donor.findById(req.user?.donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const events = await DonationEvent.find({
      status: 'upcoming',
      bloodTypesNeeded: donor.bloodGroup,
      'registeredDonors.donorId': { $ne: donor._id }
    })
    .populate('hospitalId', 'name location')
    .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available events', error });
  }
};

export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const donorId = req.user?.donorId;

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const event = await DonationEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Event is not accepting registrations' });
    }

    if (event.registeredDonors.length >= event.capacity) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }

    if (!event.bloodTypesNeeded.includes(donor.bloodGroup)) {
      return res.status(400).json({ message: 'Your blood type is not needed for this event' });
    }

    const alreadyRegistered = event.registeredDonors.some(
      reg => reg.donorId.toString() === donorId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    event.registeredDonors.push({
      donorId,
      bloodType: donor.bloodGroup,
      status: 'registered'
    });

    await event.save();
    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error });
  }
};

export const getRegisteredEvents = async (req: Request, res: Response) => {
  try {
    const donorId = req.user?.donorId;

    const events = await DonationEvent.find({
      'registeredDonors.donorId': donorId
    })
    .populate('hospitalId', 'name location')
    .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registered events', error });
  }
};