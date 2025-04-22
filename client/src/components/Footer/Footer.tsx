// src/components/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h3 className={styles.logo}>Audivine</h3>
          <p className={styles.tagline}>Your Sonic Identity Visualizer</p>
        </div>
        
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Navigation</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          
          <div className={styles.linkGroup}>
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
          
          <div className={styles.linkGroup}>
            <h4>Connect</h4>
            <a href="https://github.com/ahmed-boutar" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.instagram.com/ahmedboutar/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p>&copy; {currentYear} Audivine. All rights reserved.</p>
        <p className={styles.spotify}>
          Powered by <a href="https://developer.spotify.com/" target="_blank" rel="noopener noreferrer">Spotify API</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;