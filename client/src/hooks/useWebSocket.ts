// src/hooks/useWebSocket.ts

import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocketService';
import { MessageType } from '../utils/types';

interface WebSocketHookResult {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (messageType: MessageType, message: any) => Promise<void>;
  lastMessage: any | null;
  error: Error | null;
}

export const useWebSocket = (): WebSocketHookResult => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleMessage = useCallback((data: any) => {
    setLastMessage(data);
  }, []);

  const connect = useCallback(async () => {
    try {
      await websocketService.connect();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(async (messageType: MessageType, message: any) => {
    try {
      if (!websocketService.isWebSocketConnected()) {
        await websocketService.connect();
        setIsConnected(true);
      }
      await websocketService.sendMessage(messageType, message);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    }
  }, []);

  useEffect(() => {
    // Add message listener when component mounts
    websocketService.onMessage(handleMessage);
    
    // Remove listener when component unmounts
    return () => {
      websocketService.removeMessageListener(handleMessage);
    };
  }, [handleMessage]);

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    lastMessage,
    error
  };
};

