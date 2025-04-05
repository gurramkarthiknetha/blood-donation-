import { Request, Response } from 'express';
import DonationEvent from '../models/donationEvent';
import { sendLowInventoryNotification } from '../utils/notificationHelpers';

export const createDonationEvent = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { date, location, description, capacity, bloodTypesNeeded } = req.body;

    const event = new DonationEvent({
      hospitalId,
      date,
      location,
      description,
      capacity,
      bloodTypesNeeded
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating donation event', error });
  }
};

export const getHospitalEvents = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const events = await DonationEvent.find({ hospitalId })
      .sort({ date: -1 })
      .populate('registeredDonors.donorId', 'name email phone');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    const hospitalId = req.user?.hospitalId;

    const event = await DonationEvent.findOneAndUpdate(
      { _id: eventId, hospitalId },
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event status', error });
  }
};

export const registerDonor = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { donorId, bloodType } = req.body;

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

    if (!event.bloodTypesNeeded.includes(bloodType)) {
      return res.status(400).json({ message: 'Blood type not needed for this event' });
    }

    const alreadyRegistered = event.registeredDonors.some(
      registration => registration.donorId.toString() === donorId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Donor already registered for this event' });
    }

    event.registeredDonors.push({ donorId, bloodType });
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error registering donor', error });
  }
};

export const updateDonorStatus = async (req: Request, res: Response) => {
  try {
    const { eventId, donorId } = req.params;
    const { status } = req.body;
    const hospitalId = req.user?.hospitalId;

    const event = await DonationEvent.findOne({ _id: eventId, hospitalId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registration = event.registeredDonors.find(
      reg => reg.donorId.toString() === donorId
    );

    if (!registration) {
      return res.status(404).json({ message: 'Donor registration not found' });
    }

    registration.status = status;
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating donor status', error });
  }
};