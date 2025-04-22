import { useContext, useCallback, useState, useEffect } from 'react';
import { SpotifyAuthContext, SpotifyAuthActionType } from '../context/SpotifyAuthContext';
import { useWebSocket } from './useWebSocket';
import { MessageType } from '../utils/types';
import { websocketService } from '../services/websocketService';


export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  const { connect: connectWebSocket, isConnected: wsConnected, sendMessage, lastMessage } = useWebSocket();
  const [wsStatus, setWsStatus] = useState<string>('');
  const [wsResponse, setWsResponse] = useState<any>(null);


  if (context === undefined) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }

  const { isAuthenticated, user, accessToken, isLoading, dispatch } = context;

  useEffect(() => {
    if (lastMessage && lastMessage.message) {
      setWsResponse(lastMessage.message);
      if (!isAuthenticated) {
        handleTokenExchange(lastMessage.message);
      }
      
      setWsStatus('Connection test complete!');
    }
  }, [lastMessage]);

  const handleAuthCallback = useCallback(async (code: string) => {
    try {
      dispatch({ type: SpotifyAuthActionType.SET_LOADING, payload: true });
      
      console.log('Sending Spotify auth code via WebSocket');
      await sendMessage(MessageType.SPOTIFY_AUTH, { code });
      console.log('WebSocket message sent, waiting for response...');
  
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      dispatch({ type: SpotifyAuthActionType.SET_LOADING, payload: false });
      logout();
    }
  }, [dispatch, sendMessage]);

  const handleTokenExchange = async (wsResponse : any) => {
    try {
      const data = wsResponse;
      
      // Set token with expiry time (usually expires in 1 hour)
      const expiryTime = Date.now() + (data.expires_in * 1000);
      dispatch({
        type: SpotifyAuthActionType.SET_TOKEN,
        payload: {
          token: data.access_token,
          expiry: expiryTime
        }
      });
  
      // Fetch user data
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data from Spotify');
      }
      
      const userData = await userResponse.json();
      dispatch({
        type: SpotifyAuthActionType.SET_USER,
        payload: userData
      });
      
    } catch (error) {
      console.error('Authentication error:', error);
      logout();
    } finally {
      dispatch({ type: SpotifyAuthActionType.SET_LOADING, payload: false });
    }
  };

  // Start Spotify OAuth flow
  const login = useCallback(() => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played'
    ];
    
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('show_dialog', 'true');
    
    window.location.href = authUrl.toString();
  }, []);

  // Logout and clear stored data
  const logout = useCallback(() => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_user');
    dispatch({ type: SpotifyAuthActionType.LOGOUT });
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    login,
    logout,
    handleAuthCallback
  };
};