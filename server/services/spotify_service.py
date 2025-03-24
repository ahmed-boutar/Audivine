import requests
import os
import base64
import dotenv
from urllib.parse import urlencode

dotenv.load_dotenv()

def get_spotify_auth_url():
    """
    Generate the Spotify authorization URL
    """
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:5173/callback')
    
    auth_params = {
        'client_id': client_id,
        'response_type': 'code',
        'redirect_uri': redirect_uri,
        'scope': 'user-read-private user-read-email user-top-read',
        'show_dialog': 'true'
    }
    
    url = f"https://accounts.spotify.com/authorize?{urlencode(auth_params)}"
    return url

def exchange_code_for_tokens(code):
    """
    Exchange authorization code for access and refresh tokens
    """
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:5173/callback')
    
    # Encode client ID and secret for authorization header
    auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    
    headers = {
        'Authorization': f'Basic {auth_header}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri
    }
    
    try:
        response = requests.post(
            'https://accounts.spotify.com/api/token',
            headers=headers,
            data=urlencode(payload)
        )

        # Check if the request was successful
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "error": f"Failed to exchange code for tokens: {response.text}",
                "status_code": response.status_code
            }
            
    except Exception as e:
        return {"error": f"Exception during token exchange: {str(e)}"}

def get_user_profile(access_token):
    """
    Get the user's Spotify profile
    """
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    try:
        response = requests.get('https://api.spotify.com/v1/me', headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "error": f"Failed to get user profile: {response.text}",
                "status_code": response.status_code
            }
            
    except Exception as e:
        return {"error": f"Exception during profile fetch: {str(e)}"}