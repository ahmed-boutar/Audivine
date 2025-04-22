import os
import dotenv
from lyricsgenius import Genius

dotenv.load_dotenv()

class GeniusService:
    def __init__(self):
        self.access_token = os.getenv("GENIUS_CLIENT_ACCESS_TOKEN")
        print(f'GENIUS SERICE TOKEN: {self.access_token}')
        # Initialize the Genius API client
        self.genius = Genius(self.access_token)
        # Configure the client to exclude annotations and automatically remove section headers
        self.genius.verbose = True  # Set to True for debugging
        self.genius.remove_section_headers = False  # Set to True if you want to remove [Verse], [Chorus] headers
        self.genius.skip_non_songs = True
        self.genius._session.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    
    def get_song_lyrics(self, track_name, artist_name):
        """Main method to get lyrics for a track by artist"""
        try:
            # Search for the song
            song = self.genius.search_song(track_name, artist_name)
            if song:
                # Format the lyrics for better readability
                # The lyrics already come with line breaks
                return song.lyrics
            else:
                return None
        except Exception as e:
            print(f"Exception getting lyrics: {str(e)}")
            return None
    
    def get_artist_songs(self, artist_name, max_songs=5):
        """Get multiple songs by an artist"""
        try:
            # Get artist information
            artist = self.genius.search_artist(artist_name, max_songs=max_songs)
            if artist:
                return artist.songs
            else:
                return []
        except Exception as e:
            print(f"Exception getting artist songs: {str(e)}")
            return []
    
    def clean_lyrics(self, lyrics):
        """Clean up the lyrics by removing Genius-specific formatting"""
        if not lyrics:
            return None
            
        # Remove the Genius footer that typically appears at the end
        if "Embed" in lyrics:
            lyrics = lyrics.split("Embed")[0]
            
        # Remove the song title that appears at the beginning
        lines = lyrics.split('\n')
        if len(lines) > 0:
            lyrics = '\n'.join(lines[1:])
            
        return lyrics.strip()


def main():
    genius_service = GeniusService()
    lyrics = genius_service.get_song_lyrics('Étouffée', 'Vince Staples')
    
    if lyrics:
        # Clean the lyrics
        clean_lyrics = genius_service.clean_lyrics(lyrics)
        print(f'Lyrics:\n{clean_lyrics}')
    else:
        print("Lyrics not found")


if __name__ == '__main__':
    main()
