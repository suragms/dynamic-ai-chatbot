from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
API_KEY = os.getenv('GOOGLE_API_KEY', '')

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'reply': 'Please enter a message.'})

        gemini_payload = {
            'contents': [{
                'parts': [{
                    'text': user_message
                }]
            }],
            'generationConfig': {
                'temperature': 0.7,
                'topK': 40,
                'topP': 0.95,
                'maxOutputTokens': 1000,
                'stopSequences': []
            }
        }

        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(
            f"{GEMINI_API_URL}?key={API_KEY}",
            json=gemini_payload,
            headers=headers,
            timeout=30
        )

        if response.status_code == 200:
            response_data = response.json()

            if (response_data.get('candidates') and 
                len(response_data['candidates']) > 0 and
                response_data['candidates'][0].get('content') and
                response_data['candidates'][0]['content'].get('parts') and
                len(response_data['candidates'][0]['content']['parts']) > 0):

                ai_reply = response_data['candidates'][0]['content']['parts'][0]['text']
                return jsonify({'reply': ai_reply})
            else:
                return jsonify({'reply': 'Sorry, I received an empty response. Please try again.'})
        else:
            return jsonify({'reply': f'API Error: {response.status_code}. Please try again later.'})

    except requests.exceptions.Timeout:
        return jsonify({'reply': 'Request timed out. Please try again.'})
    except requests.exceptions.RequestException as e:
        return jsonify({'reply': 'Network error occurred. Please check your connection.'})
    except Exception as e:
        return jsonify({'reply': 'An unexpected error occurred. Please try again.'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
