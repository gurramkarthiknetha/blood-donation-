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

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header or cookie
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret') as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user has Clerk authentication
export const authenticateClerk = (req: Request, res: Response, next: NextFunction) => {
  // Get Clerk token from header
  const clerkToken = req.headers['clerk-token'] as string;

  if (!clerkToken) {
    return res.status(401).json({ message: 'Clerk authentication required' });
  }

  // In a real implementation, you would verify the Clerk token
  // For now, we'll just pass it through
  // The verification would typically be done using Clerk's SDK
  
  // Extract user ID from the token or request
  const userId = req.headers['clerk-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ message: 'Clerk user ID required' });
  }
  
  req.user = {
    userId,
    role: 'donor' // Default role for Clerk users
  };
  
  next();
};

// Middleware to check if user has specific role
export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
