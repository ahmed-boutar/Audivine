

def test_connection(payload, connection_id):
    modified_message = f"hello {payload}"
        
    response_data = {
        'type': 'CONNECTION_TEST_RESPONSE',
        'status': 'success',
        'message': f'Connection test successful: {modified_message}'
    }
    
    return response_data