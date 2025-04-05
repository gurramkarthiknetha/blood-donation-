import { Request, Response } from 'express';
import { BloodInventory } from '../models/bloodInventory';
import { WebSocketEvents } from '../utils/wsEvents';

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { bloodType, units } = req.body;
    const inventory = await BloodInventory.findOneAndUpdate(
      { bloodType },
      { $inc: { units: units } },
      { new: true, upsert: true }
    );

    // Emit WebSocket event for inventory update
    await WebSocketEvents.handleInventoryUpdate(bloodType, inventory.units);

    // Check for low inventory
    if (inventory.units < 10) {
      await WebSocketEvents.notifyLowInventory(bloodType, inventory.units);
    }

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory' });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await BloodInventory.find();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory' });
  }
};