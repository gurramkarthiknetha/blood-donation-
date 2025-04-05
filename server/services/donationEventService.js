const DonationEvent = require('../models/DonationEvent');
const { AppError } = require('../middleware/errorHandler');
const websocketService = require('./websocketService');

const donationEventService = {
  async createEvent(hospitalId, eventData) {
    const event = new DonationEvent({
      hospitalId,
      ...eventData
    });
    await event.save();
    
    websocketService.notifyRole('donor', 'new_event', {
      eventId: event._id,
      hospitalId,
      date: event.date,
      location: event.location
    });
    
    return event;
  },

  async getUpcomingEvents() {
    return DonationEvent.find({
      date: { $gt: new Date() },
      status: 'upcoming'
    }).sort({ date: 1 });
  },

  async registerDonor(eventId, donorId, bloodType) {
    const event = await DonationEvent.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status !== 'upcoming') {
      throw new AppError('Event is no longer accepting registrations', 400);
    }

    if (event.registeredDonors.length >= event.capacity) {
      throw new AppError('Event has reached maximum capacity', 400);
    }

    if (!event.bloodTypesNeeded.includes(bloodType)) {
      throw new AppError('Blood type not needed for this event', 400);
    }

    const alreadyRegistered = event.registeredDonors.some(
      donor => donor.donorId.toString() === donorId
    );
    if (alreadyRegistered) {
      throw new AppError('Donor already registered for this event', 400);
    }

    event.registeredDonors.push({ donorId, bloodType });
    await event.save();

    websocketService.notifyHospital(event.hospitalId, 'donor_registered', {
      eventId: event._id,
      donorId,
      bloodType
    });

    return event;
  },

  async updateDonorStatus(eventId, donorId, status) {
    const event = await DonationEvent.findOneAndUpdate(
      {
        _id: eventId,
        'registeredDonors.donorId': donorId
      },
      {
        $set: { 'registeredDonors.$.status': status }
      },
      { new: true }
    );

    if (!event) {
      throw new AppError('Event or donor registration not found', 404);
    }

    if (status === 'donated') {
      websocketService.notifyUser(donorId, 'donation_completed', {
        eventId: event._id,
        points: 100 // Reward points for donation
      });
    }

    return event;
  },

  async cancelEvent(eventId, reason) {
    const event = await DonationEvent.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    event.status = 'cancelled';
    await event.save();

    // Notify all registered donors
    event.registeredDonors.forEach(donor => {
      websocketService.notifyUser(donor.donorId, 'event_cancelled', {
        eventId,
        reason
      });
    });

    return event;
  }
};

module.exports = donationEventService;