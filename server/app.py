from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import boto3
import os
import logging
import dotenv 
import torch
from threading import Thread
from utils.router_helper import handle_test_connection, handle_spotify_callback, handle_generate_artwork, handle_generate_marketing

# Load environment variables 
dotenv.load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    filename='app.log')

logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)  # Enable CORS for all routes

# Configuration
AWS_REGION = 'us-east-1'  # Your AWS region
API_GATEWAY_ENDPOINT = 'https://pdoiknom87.execute-api.us-east-1.amazonaws.com/prod'  # Your WebSocket API Gateway endpoint


# Create a boto3 client for API Gateway Management API
apigateway_client = boto3.client('apigatewaymanagementapi', 
                               endpoint_url=API_GATEWAY_ENDPOINT,
                               region_name=AWS_REGION)


# Map message types to handler functions
MESSAGE_HANDLERS = {
    'testConnection': handle_test_connection,
    'spotifyCallback': handle_spotify_callback,
    'generateArtwork': handle_generate_artwork,
    'generateMarketing': handle_generate_marketing
    # 'GENERATE_ARTWORK': handle_generate_artwork,
    # 'SPOTIFY_AUTH': handle_spotify_auth,
    # 'SPOTIFY_CALLBACK': handle_spotify_callback,
    # 'GET_USER_DATA': handle_get_user_data
}

@app.route('/process-message', methods=['POST'])
def process_message():
    """
    Endpoint to process messages from Lambda.
    Adds 'hello' to the beginning of the message and returns it.
    """
    try:
        # Get the message data from the request
        data = request.json

        if not data or 'message' not in data:
            return jsonify({'error': 'Invalid request. Message is required.'}), 400

        message = data['message']
        connection_id = data.get('connectionId')

        # Check if message is a JSON string containing more structured data
        try:
            if isinstance(message, dict) and 'type' in message:
                # This is a structured message with a type
                message_type = message['type']
                payload = message.get('payload', {})
                
                # print(f"[INFO] Processing message type: {message_type}, Payload: {payload}")
                if message_type == 'generateArtwork':
                    # Acknowledge the request immediately
                    acknowledgment = {
                        'type': 'generationStarted',
                        'status': 'in progress',
                        'message': 'Artwork generation has begun'
                    }
                    
                    # Start the generation in a background thread
                    def run_generation():
                        try:
                            result = handle_generate_artwork(payload, connection_id)
                            # Send the result via websocket when complete
                            apigateway_client.post_to_connection(
                                ConnectionId=connection_id,
                                Data=json.dumps(result)
                            )
                        except Exception as e:
                            error_response = {
                                'type': 'error',
                                'message': f'Error during artwork generation: {str(e)}'
                            }
                            apigateway_client.post_to_connection(
                                ConnectionId=connection_id,
                                Data=json.dumps(error_response)
                            )
                    
                    # Start the background thread
                    Thread(target=run_generation).start()
                    
                    # Return the acknowledgment immediately
                    return jsonify(acknowledgment)

                elif message_type == 'generateMarketing':
                    # Acknowledge the request immediately
                    acknowledgment = {
                        'type': 'generationStarted',
                        'status': 'in progress',
                        'message': 'Artwork generation for artists has begun'
                    }
                    
                    # Start the generation in a background thread
                    def run_generation_for_artist():
                        try:
                            result = handle_generate_marketing(payload, connection_id)
                            # Send the result via websocket when complete
                            apigateway_client.post_to_connection(
                                ConnectionId=connection_id,
                                Data=json.dumps(result)
                            )
                        except Exception as e:
                            error_response = {
                                'type': 'error',
                                'message': f'Error during artwork generation: {str(e)}'
                            }
                            apigateway_client.post_to_connection(
                                ConnectionId=connection_id,
                                Data=json.dumps(error_response)
                            )
                    
                    # Start the background thread
                    Thread(target=run_generation_for_artist).start()
                    
                    # Return the acknowledgment immediately
                    return jsonify(acknowledgment)
                
                # Find and execute the appropriate handler
                handler = MESSAGE_HANDLERS.get(message_type)

                if handler:
                    response_data = handler(payload, connection_id)
                    print(f"[INFO] response_data = {response_data}")
                else:
                    response_data = {
                        'type': 'ERROR',
                        'message': f'Unknown message type: {message_type}'
                    }

        except (json.JSONDecodeError, TypeError):
            # Not JSON, treat as simple text message
            modified_message = f"hello {message}"
            response_data = {
                'message': modified_message,
                'originalMessage': message
            }
        
        # If connection ID is provided, we can send the response directly to the client
        print(f'connection_id = {connection_id}')
        print(f'response_data = {response_data}')
        # if connection_id:
        #     try:
        #         # Send the modified message back to the client via API Gateway
        #         apigateway_client.post_to_connection(
        #             ConnectionId=connection_id,
        #             Data=json.dumps(response_data)
        #         )
        #         return jsonify({'success': True, 'message': 'Message processed and sent to client'}), 200
        #     except Exception as e:
        #         print(f"Error sending message to client: {str(e)}")
            
        
        # Return the modified message to Lambda
        return jsonify(response_data)
        
    except Exception as e:
        print(f'ERRORING OUT WITH {e}')
        return jsonify({'error': f'Error processing message: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint.
    """
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
