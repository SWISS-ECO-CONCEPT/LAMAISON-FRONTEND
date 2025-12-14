import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

let socketInstance: Socket | null = null;

export const useSimpleSocket = () => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    if (!user?.id || socketInstance?.connected) {
      if (socketInstance && socket !== socketInstance) {
        setSocket(socketInstance);
      }
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      socketInstance = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ['websocket', 'polling'],
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('[Socket] Connected');
      });

      socketInstance.on('disconnect', () => {
        console.log('[Socket] Disconnected');
      });

      socketInstance.on('error', (error) => {
        console.error('[Socket] Error:', error);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [user?.id]);

  return socket;
};

export const emitEvent = (eventName: string, data: unknown) => {
  if (socketInstance?.connected) {
    socketInstance.emit(eventName, data);
  }
};

export const onEvent = (eventName: string, callback: (data: unknown) => void) => {
  if (socketInstance) {
    socketInstance.on(eventName, callback);
  }
};

export const offEvent = (eventName: string, callback?: (data: unknown) => void) => {
  if (socketInstance) {
    socketInstance.off(eventName, callback);
  }
};
