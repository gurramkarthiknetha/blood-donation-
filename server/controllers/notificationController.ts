import { Request, Response } from 'express';
import Notification from '../models/notification';

export const createNotification = async (hospitalId: string, message: string, type: string) => {
  try {
    const notification = new Notification({
      hospitalId,
      message,
      type
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getHospitalNotifications = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const notifications = await Notification.find({ hospitalId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

export const markNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    await Notification.updateMany(
      { hospitalId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read', error });
  }
};

export const deleteOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Notification.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });
  } catch (error) {
    console.error('Error deleting old notifications:', error);
  }
};