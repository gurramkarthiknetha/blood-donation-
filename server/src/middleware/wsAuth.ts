import { Socket } from 'socket.io';
import { verifyToken } from '../utils/auth';

export const wsAuthMiddleware = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const user = await verifyToken(token);
    if (!user) {
      return next(new Error('Invalid authentication token'));
    }

    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};