import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UseSocketOptions {
  onVoteUpdate?: (data: any) => void;
  onElectionUpdate?: (data: any) => void;
  onNotification?: (data: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Initialize socket connection
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: {
        token: token
      }
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast.error('Real-time connection failed');
    });

    // Real-time event listeners
    socket.on('voteUpdate', (data) => {
      console.log('Vote update received:', data);
      if (options.onVoteUpdate) {
        options.onVoteUpdate(data);
      }
    });

    socket.on('electionUpdate', (data) => {
      console.log('Election update received:', data);
      if (options.onElectionUpdate) {
        options.onElectionUpdate(data);
      }
      toast.success(`Election "${data.title}" has been updated`);
    });

    socket.on('notification', (data) => {
      console.log('Notification received:', data);
      if (options.onNotification) {
        options.onNotification(data);
      }
      
      // Show toast notification
      switch (data.type) {
        case 'success':
          toast.success(data.message);
          break;
        case 'warning':
          toast.error(data.message);
          break;
        case 'info':
          toast(data.message);
          break;
        default:
          toast(data.message);
      }
    });

    socket.on('electionStart', (data) => {
      toast.success(`Election "${data.title}" has started! You can now vote.`);
    });

    socket.on('electionEnd', (data) => {
      toast.success(`Election "${data.title}" has ended. Results are now available.`);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, options]);

  // Helper functions
  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', roomId);
    }
  };

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    isConnected: socketRef.current?.connected || false
  };
};