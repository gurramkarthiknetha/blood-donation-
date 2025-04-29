import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from header or cookie
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret') as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

// Middleware to check if user has Clerk authentication
export const authenticateClerk = (req: Request, res: Response, next: NextFunction): void => {
  // Get Clerk token from header
  const clerkToken = req.headers['clerk-token'] as string;

  if (!clerkToken) {
    res.status(401).json({ message: 'Clerk authentication required' });
    return;
  }

  // In a real implementation, you would verify the Clerk token
  // For now, we'll just pass it through
  // The verification would typically be done using Clerk's SDK

  // Extract user ID from the token or request
  const userId = req.headers['clerk-user-id'] as string;

  if (!userId) {
    res.status(401).json({ message: 'Clerk user ID required' });
    return;
  }

  req.user = {
    userId,
    role: 'donor' // Default role for Clerk users
  };

  next();
};

// Middleware to check if user has specific role
export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    next();
  };
};
