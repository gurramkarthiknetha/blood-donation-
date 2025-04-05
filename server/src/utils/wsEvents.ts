import { WebSocketService } from '../services/websocket';

export class WebSocketEvents {
  private static wsService: WebSocketService;

  static initialize(wsService: WebSocketService) {
    WebSocketEvents.wsService = wsService;
  }

  static async handleInventoryUpdate(bloodType: string, units: number) {
    const data = { bloodType, units, timestamp: new Date() };
    WebSocketEvents.wsService.broadcastInventoryUpdate(data);
  }

  static async handleBloodRequest(request: any) {
    WebSocketEvents.wsService.notifyBloodRequest(request);
    WebSocketEvents.wsService.notifyAdmin('new_request', request);
  }

  static async handleDonationStatusChange(userId: string, donationId: string, status: string) {
    const data = { donationId, status, timestamp: new Date() };
    WebSocketEvents.wsService.emitDonationStatus(userId, data);
  }

  static async handleSlotAvailabilityChange(slots: any[]) {
    WebSocketEvents.wsService.emitSlotAvailability(slots);
  }

  static async notifyLowInventory(bloodType: string, units: number) {
    const data = {
      type: 'low_inventory',
      bloodType,
      units,
      timestamp: new Date()
    };
    WebSocketEvents.wsService.notifyAdmin('inventory_alert', data);
  }
}