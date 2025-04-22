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
  
  /**
   * Fetches a user's top tracks from Spotify API
   * 
   * @param token Spotify access token
   * @param timeRange short_term (4 weeks), medium_term (6 months), or long_term (all time)
   * @param limit Number of tracks to fetch
   * @returns Array of track objects
   */
  export const fetchTopTracks = async (
    token: string,
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ): Promise<Track[]> => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      throw error;
    }
  };
  
  /**
   * Fetches a user's top artists from Spotify API
   * 
   * @param token Spotify access token
   * @param timeRange short_term (4 weeks), medium_term (6 months), or long_term (all time)
   * @param limit Number of artists to fetch
   * @returns Array of artist objects
   */
  export const fetchTopArtists = async (
    token: string,
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ): Promise<Artist[]> => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching top artists:', error);
      throw error;
    }
  };
  
  /**
   * Fetches a user's recently played tracks
   * 
   * @param token Spotify access token
   * @param limit Number of tracks to fetch
   * @returns Array of recently played tracks
   */
  export const fetchRecentlyPlayed = async (
    token: string,
    limit: number = 20
  ): Promise<any[]> => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      throw error;
    }
  };
  
  /**
   * Fetches detailed information about a specific track
   * 
   * @param token Spotify access token
   * @param trackId Spotify track ID
   * @returns Track object with detailed information
   */
  export const fetchTrackDetails = async (
    token: string,
    trackId: string
  ): Promise<any> => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching track details:', error);
      throw error;
    }
  };
  
  /**
   * Fetches audio features for a track (tempo, key, etc.)
   * 
   * @param token Spotify access token
   * @param trackId Spotify track ID
   * @returns Audio features object
   */
  export const fetchAudioFeatures = async (
    token: string,
    trackId: string
  ): Promise<any> => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching audio features:', error);
      throw error;
    }
  };