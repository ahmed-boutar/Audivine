// src/components/Navbar/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useSpotifyAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          Audivine
        </Link>
        <span className={styles.tagline}>Your Sonic Identity Visualizer</span>
      </div>

      <div className={styles.navLinks}>
        <Link to="/" className={styles.navLink}>
          Home
        </Link>
        <Link to="/about" className={styles.navLink}>
          About
        </Link>
        
        {isAuthenticated && user ? (
          <>
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <div className={styles.userContainer}>
              <img 
                src={user.images?.[0]?.url || '/assets/default-profile.png'} 
                alt={user.display_name} 
                className={styles.userAvatar}
              />
              <div className={styles.userDropdown}>
                <Link to="/profile" className={styles.dropdownItem}>
                  Profile
                </Link>
                <button onClick={logout} className={styles.dropdownItem}>
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <button onClick={login} className={styles.loginButton}>
            Login with Spotify
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;