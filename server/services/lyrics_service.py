import requests
import urllib.parse
import time

class LyricsService:
    """
    A service class to retrieve song lyrics using the Lyrics.ovh API.
    """
    
    def __init__(self):
        self.base_url = "https://api.lyrics.ovh/v1"
        self.backup_url = "https://private-anon-8dde784480-lyricsovh.apiary-proxy.com/v1"
        
    def get_lyrics(self, artist, title, use_backup=True):
        """
        Retrieve lyrics for a song by artist and title.
        
        Args:
            artist (str): The name of the artist/band
            title (str): The title of the song
            use_backup (bool): Whether to use the backup API endpoint
            
        Returns:
            str or None: The lyrics of the song if found, None otherwise
        """
        # URL encode the artist and title
        artist_encoded = urllib.parse.quote(artist)
        title_encoded = urllib.parse.quote(title)
        
        # Select the appropriate base URL
        base = self.backup_url if use_backup else self.base_url
        
        # Construct the full URL
        url = f"{base}/{artist_encoded}/{title_encoded}"
        
        try:
            print(f"Requesting lyrics from: {url}")
            response = requests.get(url, timeout=10)
            
            # Check if the request was successful
            if response.status_code == 200:
                data = response.json()
                return data.get("lyrics")
            else:
                print(f"Error retrieving lyrics: Status code {response.status_code}")
                print(f"Response: {response.text}")
                
                # If primary API failed, try backup if not already using it
                if not use_backup:
                    print("Trying backup API...")
                    return self.get_lyrics(artist, title, use_backup=True)
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Request exception: {e}")
            
            # If primary API failed, try backup if not already using it
            if not use_backup:
                print("Trying backup API after exception...")
                return self.get_lyrics(artist, title, use_backup=True)
            return None
    
    def get_lyrics_with_retry(self, artist, title, max_retries=1, delay=0):
        """
        Retry getting lyrics multiple times if needed.
        
        Args:
            artist (str): The name of the artist/band
            title (str): The title of the song
            max_retries (int): Maximum number of retry attempts
            delay (int): Delay between retries in seconds
            
        Returns:
            str or None: The lyrics of the song if found, None otherwise
        """
        for attempt in range(max_retries):
            try:
                print(f"Attempt {attempt + 1}/{max_retries} to get lyrics for '{title}' by '{artist}'")
                lyrics = self.get_lyrics(artist, title)
                
                if lyrics:
                    return lyrics
                else:
                    print(f"No lyrics found on attempt {attempt + 1}")
                    
                # Wait before retrying
                if attempt < max_retries - 1:
                    print(f"Waiting {delay} seconds before retry...")
                    time.sleep(delay)
                    
            except Exception as e:
                print(f"Error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    print(f"Waiting {delay} seconds before retry...")
                    time.sleep(delay)
        
        print(f"Failed to get lyrics for '{title}' by '{artist}' after {max_retries} attempts")
        return None

    def clean_lyrics(self, lyrics):
        """
        Clean up the lyrics by removing unnecessary formatting.
        
        Args:
            lyrics (str): The raw lyrics
            
        Returns:
            str: The cleaned lyrics
        """
        if not lyrics:
            return None
            
        # Remove any common unwanted patterns
        replacements = [
            ("\r\n", "\n"),  # Normalize line endings
            ("\r", "\n"),    # Normalize line endings
            ("\n\n\n+", "\n\n")  # Remove excessive empty lines
        ]
        
        result = lyrics
        for old, new in replacements:
            result = result.replace(old, new)
        
        return result.strip()


# Example usage
if __name__ == "__main__":
    service = LyricsService()
    lyrics = service.get_lyrics_with_retry("Vince Staples", "Etouffee")
    
    if lyrics:
        clean_lyrics = service.clean_lyrics(lyrics)
        print(f"\nLyrics found:\n{'-' * 40}\n{clean_lyrics}\n{'-' * 40}")
    else:
        print("No lyrics found for this song.")