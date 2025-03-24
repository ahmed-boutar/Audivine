from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import routes
from api.auth_routes import auth_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def index():
        return {"message": "Sonic Identity Visualizer API is running"}
    
    return app

app = create_app()