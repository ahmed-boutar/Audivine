// src/pages/UserSelection/UserSelection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserSelection.module.css';
import { useLocation } from 'react-router-dom';

const UserSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state;

  const handleListenerSelection = () => {
    navigate('/artwork-generator', { state: userData });
  };

  const handleArtistSelection = () => {
    navigate('/artist-marketing', { state: userData });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>What brings you to Audivine?</h1>
        <p>Choose an option that best describes you</p>
      </header>

      <div className={styles.selectionGrid}>
        <div className={styles.selectionCard}>
          <div className={styles.cardContent}>
            <div className={styles.iconContainer}>
              <i className="bi bi-headphones"></i>
            </div>
            <h2>I'm a Listener</h2>
            <p>
              Generate unique artwork based on your listening habits and musical preferences.
              Turn your Spotify data into visual art that represents your sonic identity.
            </p>
            <button 
              className={styles.selectionButton}
              onClick={handleListenerSelection}
            >
              Generate My Artwork
            </button>
          </div>
        </div>

        <div className={styles.selectionCard}>
          <div className={styles.cardContent}>
            <div className={styles.iconContainer}>
              <i className="bi bi-music-note-beamed"></i>
            </div>
            <h2>I'm an Artist</h2>
            <p>
              Create compelling marketing materials and visuals for your music.
              Design album artwork, promotional content, and more for your releases.
            </p>
            <button 
              className={styles.selectionButton}
              onClick={handleArtistSelection}
            >
              Market My Music
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionPage;