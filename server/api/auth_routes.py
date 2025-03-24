from flask import Blueprint, request, jsonify
from services.spotify_service import exchange_code_for_tokens

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/spotify-callback', methods=['POST'])
def spotify_callback():
    """
    Handle the Spotify callback and exchange authorization code for tokens
    """
    try:
        code = request.json.get('code')
        if not code:
            return jsonify({"error": "Authorization code is required"}), 400
        
        # Exchange the code for access and refresh tokens
        tokens = exchange_code_for_tokens(code)
        
        if "error" in tokens:
            return jsonify(tokens), 400
            
        return jsonify(tokens)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500