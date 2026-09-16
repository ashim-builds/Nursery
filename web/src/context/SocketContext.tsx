import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getBackendOrigin } from '../utils/image';
import { invalidateAllProductQueries } from '../utils/queryInvalidation';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    const origin = getBackendOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
    const socket = io(origin, {
      path: '/socket.io',
      transports: ['polling'], // cPanel Phusion Passenger does not support raw WebSocket proxying; long-polling is 100% reliable
      upgrade: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle connection errors gracefully without breaking application runtime
    socket.on('connect_error', (_err) => {
      setIsConnected(false);
    });

    // Real-time Event Listeners -> Trigger React Query Invalidations
    const handleProductChange = () => {
      invalidateAllProductQueries(queryClient);
    };

    const handleInventoryChange = () => {
      invalidateAllProductQueries(queryClient);
    };

    const handleOrderChange = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics-full'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    };

    const handleSettingsChange = () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
    };

    const handleNotificationChange = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('product:created', handleProductChange);
    socket.on('product:updated', handleProductChange);
    socket.on('product:deleted', handleProductChange);
    socket.on('product:changed', handleProductChange);

    socket.on('inventory:updated', handleInventoryChange);

    socket.on('order:created', handleOrderChange);
    socket.on('order:updated', handleOrderChange);
    socket.on('order:status_changed', handleOrderChange);
    socket.on('order:changed', handleOrderChange);

    socket.on('settings:updated', handleSettingsChange);

    socket.on('notification:created', handleNotificationChange);
    socket.on('notification:new', handleNotificationChange);
    socket.on('notification:broadcast', handleNotificationChange);

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
