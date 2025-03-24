import { useContext, useCallback } from 'react';
import { SpotifyAuthContext, SpotifyAuthActionType } from '../context/SpotifyAuthContext';

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);

  if (context === undefined) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }

  const { isAuthenticated, user, accessToken, isLoading, dispatch } = context;

  // Handle login callback from Spotify OAuth
  const handleAuthCallback = useCallback(async (code: string) => {
    try {
      dispatch({ type: SpotifyAuthActionType.SET_LOADING, payload: true });
      
      // Call your API to exchange the code for tokens
      const response = await fetch('/api/auth/spotify-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with Spotify');
      }
      
      const data = await response.json();
      
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
    }
  }, [dispatch]);

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