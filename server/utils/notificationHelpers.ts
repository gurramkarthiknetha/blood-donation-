import { createNotification } from '../controllers/notificationController';
import { WebSocketService } from '../services/websocket';

let wsService: WebSocketService;

export const initializeNotificationHelpers = (websocketService: WebSocketService) => {
  wsService = websocketService;
};

export const sendRequestApprovedNotification = async (hospitalId: string, requestDetails: any) => {
  const message = `Your blood request for ${requestDetails.quantity} units of ${requestDetails.bloodType} has been approved.`;
  const notification = await createNotification(hospitalId, message, 'request_approved');
  wsService?.sendNotification(hospitalId, notification);
};

export const sendRequestRejectedNotification = async (hospitalId: string, requestDetails: any, reason: string) => {
  const message = `Your blood request for ${requestDetails.quantity} units of ${requestDetails.bloodType} has been rejected. Reason: ${reason}`;
  const notification = await createNotification(hospitalId, message, 'request_rejected');
  wsService?.sendNotification(hospitalId, notification);
};

export const sendLowInventoryNotification = async (hospitalId: string, bloodType: string, quantity: number) => {
  const message = `Low inventory alert: ${bloodType} blood type is running low (${quantity} units remaining).`;
  const notification = await createNotification(hospitalId, message, 'inventory_low');
  wsService?.sendNotification(hospitalId, notification);
};