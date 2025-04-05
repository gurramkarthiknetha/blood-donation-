import { Socket } from 'socket.io';
import { logger } from '../utils/logger';

export const wsErrorHandler = (socket: Socket) => {
  socket.on('error', (error) => {
    logger.error('WebSocket error:', error);
    socket.emit('error', { message: 'Internal server error' });
  });

  socket.on('connect_error', (error) => {
    logger.error('Connection error:', error);
    socket.emit('error', { message: 'Connection error' });
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected. Reason: ${reason}`);
    if (reason === 'transport error') {
      socket.emit('error', { message: 'Transport error occurred' });
    }
  });
};