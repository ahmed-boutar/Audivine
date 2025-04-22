// src/pages/Callback/Callback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import styles from './Callback.module.css';

const CallbackPage: React.FC = () => {
  const { handleAuthCallback } = useSpotifyAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processAuth = async () => {
      // Get the authorization code from URL
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code found');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        await handleAuthCallback(code);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error in authentication callback:', err);
        setError('Failed to complete authentication');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processAuth();
  }, [handleAuthCallback, location.search, navigate]);

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.error}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting to home page...</p>
        </div>
      ) : (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Authenticating with Spotify</h2>
          <p>Please wait while we complete the process...</p>
        </div>
      )}
    </div>
  );
};

export default CallbackPage;