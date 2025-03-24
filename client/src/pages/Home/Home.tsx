// src/pages/Home/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import styles from './Home.module.css';

const HomePage: React.FC = () => {
  const { isAuthenticated, login } = useSpotifyAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      login();
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Transform Your <span>Music</span> Into Visual Art</h1>
        <p className={styles.tagline}>
          Audivine creates unique artwork from your Spotify listening habits, 
          turning your musical identity into a visual experience.
        </p>
        
        <div className={styles.actions}>
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started with Spotify'}
          </button>
          <a href="#features" className={styles.secondaryButton}>
            Learn More
          </a>
        </div>
        
        <div className={styles.previewImage}>
          {/* Placeholder image for the visual */}
          <div className={styles.placeholder}>
            <div className={styles.albumArt}></div>
            <div className={styles.visualization}></div>
          </div>
        </div>
      </section>
      
      <section id="features" className={styles.features}>
        <h2>How It Works</h2>
        
        <div className={styles.featureCards}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎧</div>
            <h3>Connect</h3>
            <p>Login with your Spotify account to access your top songs and albums.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3>Create</h3>
            <p>We analyze your music and transform it into a unique visual experience.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>Share</h3>
            <p>Download your sonic identity artwork or share it directly to social media.</p>
          </div>
        </div>
      </section>
      
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <h2>For Listeners & Artists</h2>
          <p>
            Whether you're a music lover wanting to visualize your unique taste or an artist
            looking to create a visual journey through your albums, Audivine helps you express
            your musical identity through beautiful AI-generated artwork.
          </p>
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {isAuthenticated ? 'Go to Dashboard' : 'Connect with Spotify'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;