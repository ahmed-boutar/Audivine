// src/context/SpotifyAuthContext.tsx
import React, { createContext, useReducer, useEffect } from 'react';

interface SpotifyUser {
  id: string;
  display_name: string;
  images?: Array<{ url: string }>;
  email?: string;
  product?: string;
}

interface SpotifyAuthState {
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  tokenExpiry: number | null;
  isLoading: boolean;
}

enum SpotifyAuthActionType {
  SET_USER = 'SET_USER',
  SET_TOKEN = 'SET_TOKEN',
  LOGOUT = 'LOGOUT',
  SET_LOADING = 'SET_LOADING'
}

type SpotifyAuthAction = 
  | { type: SpotifyAuthActionType.SET_USER; payload: SpotifyUser }
  | { type: SpotifyAuthActionType.SET_TOKEN; payload: { token: string; expiry: number } }
  | { type: SpotifyAuthActionType.LOGOUT }
  | { type: SpotifyAuthActionType.SET_LOADING; payload: boolean };

interface SpotifyAuthContextType {
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  isLoading: boolean;
  dispatch: React.Dispatch<SpotifyAuthAction>;
}

const initialState: SpotifyAuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  tokenExpiry: null,
  isLoading: true
};

export const SpotifyAuthContext = createContext<SpotifyAuthContextType | undefined>(undefined);

const authReducer = (state: SpotifyAuthState, action: SpotifyAuthAction): SpotifyAuthState => {
  switch (action.type) {
    case SpotifyAuthActionType.SET_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false
      };
    case SpotifyAuthActionType.SET_TOKEN:
      return {
        ...state,
        accessToken: action.payload.token,
        tokenExpiry: action.payload.expiry
      };
    case SpotifyAuthActionType.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
    case SpotifyAuthActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const SpotifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored auth data on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('spotify_access_token');
        const storedExpiry = localStorage.getItem('spotify_token_expiry');
        const storedUser = localStorage.getItem('spotify_user');

        if (
          storedToken && 
          storedExpiry && 
          parseInt(storedExpiry) > Date.now() && 
          storedUser
        ) {
          // Token exists and is valid
          dispatch({ 
            type: SpotifyAuthActionType.SET_TOKEN, 
            payload: { 
              token: storedToken, 
              expiry: parseInt(storedExpiry) 
            } 
          });
          
          dispatch({ 
            type: SpotifyAuthActionType.SET_USER, 
            payload: JSON.parse(storedUser) 
          });
        } else {
          // Token doesn't exist or is expired
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_token_expiry');
          localStorage.removeItem('spotify_user');
          dispatch({ type: SpotifyAuthActionType.LOGOUT });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        dispatch({ type: SpotifyAuthActionType.LOGOUT });
      }
    };

    checkAuth();
  }, []);

  // Save auth data when it changes
  useEffect(() => {
    if (state.accessToken && state.tokenExpiry && state.user) {
      localStorage.setItem('spotify_access_token', state.accessToken);
      localStorage.setItem('spotify_token_expiry', state.tokenExpiry.toString());
      localStorage.setItem('spotify_user', JSON.stringify(state.user));
    }
  }, [state.accessToken, state.tokenExpiry, state.user]);

  return (
    <SpotifyAuthContext.Provider 
      value={{ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user, 
        accessToken: state.accessToken,
        isLoading: state.isLoading,
        dispatch 
      }}
    >
      {children}
    </SpotifyAuthContext.Provider>
  );
};

// Export action types for use in the hook
export { SpotifyAuthActionType };