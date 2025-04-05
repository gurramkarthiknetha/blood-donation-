const donationEventService = require('../services/donationEventService');
const { AppError } = require('../middleware/errorHandler');

const donationEventController = {
  async createEvent(req, res, next) {
    try {
      const event = await donationEventService.createEvent(
        req.user.hospitalId,
        req.body
      );
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  },

  async getUpcomingEvents(req, res, next) {
    try {
      const events = await donationEventService.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      next(error);
    }
  },

  async registerForEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const { bloodType } = req.body;
      const event = await donationEventService.registerDonor(
        eventId,
        req.user.id,
        bloodType
      );
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async updateDonorStatus(req, res, next) {
    try {
      const { eventId, donorId } = req.params;
      const { status } = req.body;
      
      if (!['checked-in', 'donated', 'no-show'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const event = await donationEventService.updateDonorStatus(
        eventId,
        donorId,
        status
      );
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async cancelEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const { reason } = req.body;

      // Verify hospital ownership
      const event = await donationEventService.cancelEvent(eventId, reason);
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async getEventDetails(req, res, next) {
    try {
      const { eventId } = req.params;
      const event = await donationEventService.getEventById(eventId);
      if (!event) {
        throw new AppError('Event not found', 404);
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = donationEventController;