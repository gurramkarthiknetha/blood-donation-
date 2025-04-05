import { Request, Response } from 'express';
import { Donation } from '../models/donation';
import { WebSocketEvents } from '../utils/wsEvents';
import { DonationSlot } from '../models/donationSlot';

export const createDonation = async (req: Request, res: Response) => {
  try {
    const { slotId, ...donationData } = req.body;
    const donation = new Donation({
      ...donationData,
      donor: req.user.id
    });
    await donation.save();

    // Update slot availability
    await DonationSlot.findByIdAndUpdate(slotId, { isAvailable: false });
    const availableSlots = await DonationSlot.find({ isAvailable: true });
    await WebSocketEvents.handleSlotAvailabilityChange(availableSlots);

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating donation' });
  }
};

export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const donation = await Donation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('donor');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Notify donor about status change
    await WebSocketEvents.handleDonationStatusChange(
      donation.donor.id,
      donation.id,
      status
    );

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating donation status' });
  }
};