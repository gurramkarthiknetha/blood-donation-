import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: Types.ObjectId;
        hospitalId?: Types.ObjectId;
        role?: string;
      };
    }
  }
}