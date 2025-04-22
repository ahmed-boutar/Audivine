'''
Acts as a router since I am processing everything as a single message in the front end
'''
from .test_connection import test_connection
from services.spotify_service import spotify_callback
from services.artwork_generation_service import ArtworkGenerationService 

def handle_test_connection(payload, connection_id):
    """Handle test connection messages"""
    response_data = test_connection(payload, connection_id)
    return response_data


def handle_spotify_callback(payload, connection_id):
    """Handle Spotify callback route"""
    print('\n in spotify callback handler')
    response = spotify_callback(payload)
    response_data = {
        'type': 'SPOFITY_CALLBACK_RESPONSE',
        'status': 'success',
        'message': response
    }
    print(f'\n response in spotify call back = {response}')
    return response_data

def handle_generate_artwork(payload, connection_id):
    """Handle artwork generation for regular listeners route"""
    print('\nHandling artwork generation for listeners...')
    artwork_generation_service = ArtworkGenerationService()
    image_url, custom_user_story = artwork_generation_service.generate_artwork_for_listener(payload)
    response_data = {
        'type': 'ARTWORK_GENERATION_LISTENER_RESPONSE',
        'status': 'success',
        'message': {
            'image': image_url,
            'story': custom_user_story
        }

    }
    return response_data

def handle_generate_marketing(payload, connection_id):
    """Handle artwork generation for artists route"""
    print('\nHandling artwork generation for listeners...')
    artwork_generation_service = ArtworkGenerationService()
    custom_album_story, song_images = artwork_generation_service.generate_marketing_for_artists(payload)
    response_data = {
        'type': 'ARTWORK_GENERATION_ARTIST_RESPONSE',
        'status': 'success',
        'message': {
            "custom_album_story": custom_album_story,
            "song_images": song_images
        }
    }

    return response_data
