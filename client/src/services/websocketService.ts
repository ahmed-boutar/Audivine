// src/services/websocketService.ts
import { MessageType } from '../utils/types';
import { WebSocketMessage } from '../utils/interfaces';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private isConnected: boolean = false;
  private manuallyClosed: boolean = false;

  private messageListeners: ((data: any) => void)[] = [];

  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeoutBase: number = 1000; // base: 1 second

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connection is established
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.cleanupSocket(); // clean old listeners if any

        this.socket = new WebSocket(this.url);
        this.manuallyClosed = false;

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          console.log('Message received:', event.data);
          try {
            const parsedData = JSON.parse(event.data);
            this.messageListeners.forEach((listener) => listener(parsedData));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.isConnected = false;

          if (!this.manuallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const timeout = Math.min(this.reconnectTimeoutBase * Math.pow(2, this.reconnectAttempts), 30000); // cap at 30s
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${timeout / 1000}s...`);

            setTimeout(() => {
              this.connect().catch(err => {
                console.error('Reconnection failed:', err);
              });
            }, timeout);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Send a message to the WebSocket server
   * @param messageType The type of the message
   * @param message The actual message payload
   * @returns Promise that resolves when message is sent
   */
  sendMessage(messageType: MessageType, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.log("Error in sendMessage in service: WebSocket not connected");
        console.log(this.socket);
        console.log(this.socket?.readyState);
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        const messageToSend = {
          action: 'sendMessage',
          message: {
            type: messageType,
            payload: message
          }
        };

        this.socket.send(JSON.stringify(messageToSend));
        console.log('Message sent:', messageToSend);
        resolve();
      } catch (error) {
        console.error('Error sending message:', error);
        reject(error);
      }
    });
  }

  /**
   * Add a listener for incoming messages
   * @param listener Function to call when a message is received
   */
  onMessage(listener: (data: any) => void): void {
    this.messageListeners.push(listener);
  }

  /**
   * Remove a message listener
   * @param listener The listener to remove
   */
  removeMessageListener(listener: (data: any) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }
  
  /**
   * Add native WebSocket event listeners (open/close)
   */
  addEventListener(event: 'open' | 'close', handler: () => void): void {
    if (this.socket) {
      this.socket.addEventListener(event, handler);
    }
  }

  /**
   * Remove native WebSocket event listeners (open/close)
   */
  removeEventListener(event: 'open' | 'close', handler: () => void): void {
    if (this.socket) {
      this.socket.removeEventListener(event, handler);
    }
  }

  /**
   * Close the WebSocket connection manually
   */
  disconnect(): void {
    this.manuallyClosed = true;
    if (this.socket) {
      this.socket.close();
      this.cleanupSocket();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Whether the WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Remove event handlers to prevent duplicates on reconnect
   */
  private cleanupSocket(): void {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
    }
  }
}

// Create and export a singleton instance
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
export const websocketService = new WebSocketService(WEBSOCKET_URL);

