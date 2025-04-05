import { useEffect } from 'react';
import { wsService } from '../services/websocketService';

export const useWebSocket = (event: string, handler: Function) => {
  useEffect(() => {
    wsService.on(event, handler);
    
    return () => {
      wsService.off(event, handler);
    };
  }, [event, handler]);
};