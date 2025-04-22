// src/utils/interfaces.ts
import { AuthActionType } from './types';
import { MessageType } from './types';

export interface AuthState {
  user: any | null;
}

export interface AuthContextType {
  user: any | null;
  dispatch: React.Dispatch<{ type: AuthActionType; payload?: any }>;
}

// You can extend this with additional interfaces as needed for Spotify user data
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
  product: string;
  // Add other relevant Spotify user properties
}

export interface WebSocketMessage {
  action: MessageType | string;
  payload?: any;
  message?: string; // For backward compatibility with existing code
}

export interface WebSocketResponse {
  type: string;
  message?: string;
  status?: string;
  error?: string;
  [key: string]: any; // Allow any additional properties
}