import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const admin = await Admin.findOne({ _id: decoded.id });

    if (!admin) {
      throw new Error('Admin not found');
    }

    req.body.adminId = admin._id;
    req.body.adminRole = admin.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const adminRoleCheck = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.body.adminRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};