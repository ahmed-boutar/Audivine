// src/pages/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import { fetchTopTracks, fetchTopArtists } from '../../services/spotifyService';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
}

const DashboardPage: React.FC = () => {
  const { user, accessToken } = useSpotifyAuth();
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists'>('tracks');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        const tracks = await fetchTopTracks(accessToken, timeRange);
        const artists = await fetchTopArtists(accessToken, timeRange);
        
        setTopTracks(tracks);
        setTopArtists(artists);
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken, timeRange]);

  const handleTimeRangeChange = (range: 'short_term' | 'medium_term' | 'long_term') => {
    setTimeRange(range);
  };

  const handleGenerateArtwork = () => {
    setIsGenerating(true);
    const userData = {
      topTracks: topTracks,
    }
    navigate('/user-selection', { state: userData });
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'short_term': return 'Last 4 Weeks';
      case 'medium_term': return 'Last 6 Months';
      case 'long_term': return 'All Time';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your music data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome, {user?.display_name}</h1>
        <p>Create a visual representation of your musical identity</p>
      </header>

      <div className={styles.timeFilter}>
        <span>Time Range: </span>
        <div className={styles.timeButtons}>
          <button 
            className={timeRange === 'short_term' ? styles.active : ''} 
            onClick={() => handleTimeRangeChange('short_term')}
          >
            Last 4 Weeks
          </button>
          <button 
            className={timeRange === 'medium_term' ? styles.active : ''} 
            onClick={() => handleTimeRangeChange('medium_term')}
          >
            Last 6 Months
          </button>
          <button 
            className={timeRange === 'long_term' ? styles.active : ''} 
            onClick={() => handleTimeRangeChange('long_term')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={activeTab === 'tracks' ? styles.activeTab : ''} 
          onClick={() => setActiveTab('tracks')}
        >
          Top Tracks
        </button>
        <button 
          className={activeTab === 'artists' ? styles.activeTab : ''} 
          onClick={() => setActiveTab('artists')}
        >
          Top Artists
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'tracks' && (
          <div className={styles.tracksGrid}>
            {/* TODO: Modify based on the number of songs
            Set this to 15 cause it looks nice */}
            {topTracks.slice(0, 5).map((track) => (
              <div key={track.id} className={styles.trackCard}>
                <img 
                  src={track.album.images[0]?.url} 
                  alt={track.album.name} 
                  className={styles.albumCover}
                />
                <div className={styles.trackInfo}>
                  <h3>{track.name}</h3>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className={styles.artistsGrid}>
            {/* TODO: Modify based on the number of artists
            Set this to 15 cause it looks nice */}
            {topArtists.slice(0, 15).map((artist) => (
              <div key={artist.id} className={styles.artistCard}>
                <img 
                  src={artist.images[0]?.url} 
                  alt={artist.name} 
                  className={styles.artistImage}
                />
                <div className={styles.artistInfo}>
                  <h3>{artist.name}</h3>
                  <p>{artist.genres.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.generationSection}>
        <h2>Generate Your Sonic Identity Artwork</h2>
        <p>
          Create a unique visual representation based on your {getTimeRangeLabel().toLowerCase()} favorites.
          We'll analyze your music taste and transform it into personalized artwork.
        </p>
        
        <button 
          className={styles.generateButton}
          onClick={handleGenerateArtwork}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className={styles.smallSpinner}></div>
              Generating...
            </>
          ) : (
            'Generate Artwork'
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;