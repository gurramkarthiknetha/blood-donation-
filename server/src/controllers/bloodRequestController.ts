import { Request, Response } from 'express';
import { BloodRequest } from '../models/bloodRequest';
import { WebSocketEvents } from '../utils/wsEvents';

export const createBloodRequest = async (req: Request, res: Response) => {
  try {
    const request = new BloodRequest({
      ...req.body,
      hospital: req.user.id
    });
    await request.save();

    // Emit WebSocket event for new blood request
    await WebSocketEvents.handleBloodRequest(request);

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blood request' });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await BloodRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('hospital');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Notify hospital about status change
    await WebSocketEvents.notifyUser(request.hospital.id, 'request_status', {
      requestId: id,
      status,
      timestamp: new Date()
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status' });
  }
};