import { Request, Response } from 'express';
import Hospital from '../models/hospital';
import InventoryHistory from '../models/inventoryHistory';
import { sendLowInventoryNotification } from '../utils/notificationHelpers';

export const getInventoryHistory = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const history = await InventoryHistory.find({ hospitalId })
      .sort({ date: -1 })
      .limit(100);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory history', error });
  }
};

export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await InventoryHistory.aggregate([
      {
        $match: {
          hospitalId: hospitalId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            bloodType: '$bloodType',
            type: '$type'
          },
          total: { $sum: '$quantity' }
        }
      }
    ]);

    const formattedStats = stats.reduce((acc: any, curr) => {
      const bloodType = curr._id.bloodType;
      if (!acc[bloodType]) {
        acc[bloodType] = { bloodType, used: 0, received: 0 };
      }
      if (curr._id.type === 'used') {
        acc[bloodType].used = curr.total;
      } else if (curr._id.type === 'received') {
        acc[bloodType].received = curr.total;
      }
      return acc;
    }, {});

    res.json(Object.values(formattedStats));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching usage stats', error });
  }
};

export const recordBloodUsage = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { bloodType, quantity, notes } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const bloodStock = hospital.bloodInventory.find(
      stock => stock.bloodType === bloodType
    );

    if (!bloodStock || bloodStock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient blood stock' });
    }

    // Update inventory
    bloodStock.quantity -= quantity;
    await hospital.save();

    // Record usage
    const history = new InventoryHistory({
      hospitalId,
      bloodType,
      quantity,
      type: 'used',
      notes
    });
    await history.save();

    // Check if stock is low
    if (bloodStock.quantity <= 10) {
      await sendLowInventoryNotification(hospitalId, bloodType, bloodStock.quantity);
    }

    res.json({ message: 'Blood usage recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording blood usage', error });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.user?.hospitalId;
    const { bloodType, quantity, type = 'updated', notes } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    let bloodStock = hospital.bloodInventory.find(
      stock => stock.bloodType === bloodType
    );

    if (!bloodStock) {
      bloodStock = {
        bloodType,
        quantity: 0,
        lastUpdated: new Date()
      };
      hospital.bloodInventory.push(bloodStock);
    }

    const oldQuantity = bloodStock.quantity;
    bloodStock.quantity = quantity;
    bloodStock.lastUpdated = new Date();
    await hospital.save();

    // Record history
    const history = new InventoryHistory({
      hospitalId,
      bloodType,
      quantity: quantity - oldQuantity,
      type,
      notes
    });
    await history.save();

    if (quantity <= 10) {
      await sendLowInventoryNotification(hospitalId, bloodType, quantity);
    }

    res.json({ message: 'Inventory updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory', error });
  }
};