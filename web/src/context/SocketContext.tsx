import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getBackendOrigin } from '../utils/image';

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
      transports: ['polling', 'websocket'], // Polling first guarantees 100% compatibility across cPanel reverse proxies
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['latest-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-catalog-simple'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics-full'] });
    };

    const handleInventoryChange = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-catalog-simple'] });
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
