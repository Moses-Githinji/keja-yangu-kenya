import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect using singleton
      const socketInstance = connectSocket();
      setSocket(socketInstance);

      // Listeners
      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsers(users);
      };

      socketInstance.on('get-online-users', handleOnlineUsers);

      return () => {
        socketInstance.off('get-online-users', handleOnlineUsers);
        // We might not want to fully disconnect if other components use it, 
        // but for now, if the provider unmounts or auth changes, we disconnect.
        disconnectSocket();
        setSocket(null);
      };
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
