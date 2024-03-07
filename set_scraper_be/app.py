from flask import Flask, request, jsonify
import requests
import re
# import psycopg2
from dotenv import load_dotenv
import os
from werkzeug.serving import run_simple
from flask_cors import CORS
from flask_cors import cross_origin
from flask_caching import Cache
from datetime import datetime, timedelta
import pytz  # Ensure you have pytz installed for timezone-aware datetimes


# import redis

app = Flask(__name__)
# Configure CORS
CORS(app, resources={r"/*": {"origins": "https://set-scrapper-fe-2l2i6lgdxq-wl.a.run.app"}}, supports_credentials=True)

# CORS(app, supports_credentials=True)
load_dotenv()


# redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

API_KEY = os.getenv('API_KEY')
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REFRESH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'



cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300}) # 300 seconds = 5 minutes

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"



def get_refresh_token(google_id):
    return ''
    # Attempt to get the refresh token from Redis cache
    # refresh_token = redis_client.get(f"user:{google_id}:refresh_token")
    # if refresh_token is None:
    #     # If not in cache, retrieve from secure storage, then cache it
    #     refresh_token = retrieve_refresh_token_from_secure_storage(google_id)
    #     redis_client.setex(f"user:{google_id}:refresh_token", 3600, refresh_token)  # Cache for 1 hour
    # return refresh_token

def retrieve_refresh_token_from_secure_storage(google_id):
    # Placeholder for fetching the refresh token from your secure persistent storage
    # Implement your secure storage access logic here, possibly querying a database
    # For demonstration, returning a placeholder
    return "securely_stored_refresh_token"

@app.route('/api/store-token', methods=['POST'])
def store_token():
    # Endpoint to securely store refresh token associated with a Google ID
    data = request.json
    google_id = data.get('googleId')
    access_token = data.get('accessToken')  # Optional: handle/store access token as needed

    # Here, you should securely store the refresh token that your backend obtained during OAuth
    # For this example, we're just logging the Google ID
    print(f"Storing tokens for Google ID: {google_id}")

    # Placeholder response
    return jsonify({"message": "Token stored successfully"}), 200

@app.route('/api/refresh-token', methods=['POST'])
def refresh_token():
    google_id = request.json.get('googleId')
    refresh_token = get_refresh_token(google_id)

    # Use the refresh token to request a new access token
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
    }

    response = requests.post(REFRESH_TOKEN_ENDPOINT, data=data)
    token_response = response.json()

    # Return the new access token to the client
    return jsonify({
        'access_token': token_response.get('access_token'),
        'expires_in': token_response.get('expires_in'),  # Time in seconds until the token expires
    })



def get_cache_key(channelId):
    # Generate a unique cache key for the given channelId
    return f"videos_{channelId}"


@app.route('/api/videos', methods=['POST'])
def get_videos():
    data = request.get_json()
    channelId = data.get('channelId', None)
    if not channelId:
        return jsonify({"error": "channelId is required in the request body"}), 400

    cache_key = get_cache_key(channelId)
    cached_response = cache.get(cache_key)
    if cached_response:
        # print("Returning cached response")
        return jsonify(cached_response)


    YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search'
    part = 'snippet'
    maxResults = 50
    order = 'date'
    type = 'video'
    params = {
        'part': part,
        'channelId': channelId,
        'maxResults': maxResults,
        'order': order,
        'type': type,
        'key': API_KEY,
    }
    response = requests.get(YOUTUBE_API_URL, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch videos"}), response.status_code
    
    videos = response.json().get('items', [])
    three_days_ago = datetime.now(pytz.UTC) - timedelta(days=3)
    filtered_videos = [video for video in videos if datetime.fromisoformat(video['snippet']['publishedAt'][:-1]+"+00:00") < three_days_ago]

    # Cache the response for next time
    cache.set(cache_key, filtered_videos, timeout=1800)  # Cache for 30 minutes

    return jsonify(filtered_videos)


def extract_unique_youtube_ids(html_content):
    """
    Extracts YouTube video IDs from the given HTML content, aiming to minimize capturing extraneous IDs.
    
    Parameters:
    - html_content (str): A string containing the HTML content.
    
    Returns:
    - list: A list of unique YouTube video IDs found in the HTML content.
    """
    # Regular expression to match YouTube video IDs in the HTML content
    # This pattern is designed to be selective, capturing IDs that appear in specific contexts
    video_id_regex = r"watch\?v=([a-zA-Z0-9_-]{11})"

    
    # Use regex to find all matches in the HTML content
    found_video_ids = re.findall(video_id_regex, html_content)

    
    # Remove duplicate IDs by converting the list to a set, then back to a list
    unique_video_ids = list(set(found_video_ids))
    
    return unique_video_ids



def get_html_from_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Will raise an HTTPError if the HTTP request returned an unsuccessful status code
        return response.text
    except requests.RequestException as error:
        print('Error fetching HTML:', error)
        return None
    
@app.route('/get-youtube-info-2', methods=['POST'])
def get_youtube_info():
    # print("GET YOUTUBE INFO CALLED")
    reference_id = request.json.get('referenceId')
    if not reference_id:
        return jsonify({'error': 'No reference ID provided'}), 400

    html = get_html_from_url(f'https://www.youtube.com/watch?v={reference_id}')
    if html is None:
        return jsonify({'error': 'Failed to fetch YouTube page'}), 500

    pattern = re.compile(r'videoDescriptionMusicSectionRenderer([\s\S]*?)videoDescriptionInfocardsSectionRenderer')
    html_section = pattern.search(html)
    if not html_section:
        return jsonify({'error': 'No matching section found in the HTML'}), 404

    regex = re.compile(r'"webCommandMetadata":{"url":"\/watch\?v=([^"]+)","webPageType":"WEB_PAGE_TYPE_WATCH"')
    ids = list(set(match.group(1) for match in regex.finditer(html_section.group(0))))

    links = [f'https://www.youtube.com/watch?v={id}' for id in ids]
    

    return jsonify({'ids': ids, 'links': links, 'success': True})


def extract_number_of_songs(text_snippet):
    """
    Extracts the number of songs from a given text snippet.
    
    Parameters:
    - text_snippet (str): The text snippet containing the number of songs.
    
    Returns:
    - int: The number of songs extracted from the snippet, or None if not found.
    """
    # Define the regex pattern to match the number of songs
    pattern = r'\{"simpleText":"Music"\},"subtitle":\{"simpleText":"(\d+) songs"\}'
    
    # Use regex to find the number of songs in the text snippet
    match = re.search(pattern, text_snippet)
    
    if match:
        # If a match is found, convert the matched number to an integer and return it
        return int(match.group(1))
    else:
        # If no match is found, return None
        return 0


def remove_before_pattern(html_content):
    """
    Removes everything in the HTML content string that occurs before a specific pattern.
    
    Parameters:
    - html_content (str): The HTML content as a string.
    
    Returns:
    - str: The modified HTML content with everything removed before the specified pattern.
    """
    # Define the regex pattern
    pattern = r'{"showMoreText":{"simpleText":"Show more"},"showLessText":{"simpleText":"Show less"}'
    
    # Search for the pattern and find the first match
    match = re.search(pattern, html_content)

    if match:
        # Find the index where the match starts
        start_index = match.start()
        # Return the substring from the start of the match to the end of the HTML content
        return html_content[start_index:]
    else:
        # If the pattern is not found, return the original HTML content
        return html_content
    

def remove_after_pattern(html_content):
    """
    Removes everything in the HTML content string that occurs after a specific pattern.
    
    Parameters:
    - html_content (str): The HTML content as a string.
    
    Returns:
    - str: The modified HTML content with everything removed after the specified pattern.
    """
    # Define the regex pattern
    pattern = r'\{"simpleText":"Music"\},"subtitle":\{"simpleText":"(\d+) songs"\}'
    
    # Search for the pattern and find the first match
    match = re.search(pattern, html_content)
    
    if match:
        # Find the index where the match ends
        end_index = match.end()
        # Return the substring from the beginning of the HTML content up to the end of the match
        return html_content[:end_index]
    else:
        # If the pattern is not found, return the original HTML content
        return'mooo'



@app.route('/get-youtube-info-init', methods=['GET', 'POST', 'OPTIONS'])
def get_youtube_info_init():
    
    reference_id = 'C1EzGpUCX44'

    if not reference_id:
        return jsonify({'error': 'No reference ID provided'}), 400

    html = get_html_from_url(f'https://www.youtube.com/watch?v={reference_id}')
    if html is None:
        return jsonify({'error': 'Failed to fetch YouTube page'}), 500

    song_count =  extract_number_of_songs(html)
    if(song_count > 0):
        html = remove_after_pattern(html)
        html = remove_before_pattern(html)
        ids = extract_unique_youtube_ids(html)
        links = [f'https://www.youtube.com/watch?v={id}' for id in ids]
        return jsonify({'links': links, 'success': True, 'song_count': song_count})

    else:
        return jsonify({'success' : False})
    

def get_video_details(video_ids):
    """Fetch video details for given video IDs from YouTube Data API."""
    ids_string = ','.join(video_ids)  # Convert list of IDs to a comma-separated string
    url = f"https://www.googleapis.com/youtube/v3/videos?id={ids_string}&key={API_KEY}&part=snippet,contentDetails,statistics"
    
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('items', [])
    else:
        print(f"Error fetching video details: {response.status_code}")
        return []

@app.route('/scrape_set', methods=['POST'])
@cross_origin()  # Enables CORS for this specific route
def scrape_set():
    video_id = request.json.get('videoId')
    if not video_id:
        return jsonify({'error': 'No video ID provided'}), 400
    
    # Use a separate function to handle the logic you want to cache
    response = fetch_video_data(video_id)
    return jsonify(response)



@cache.memoize(timeout=300)  # Cache this function's return value for 5 minutes
def fetch_video_data(video_id):
    html = get_html_from_url(f'https://www.youtube.com/watch?v={video_id}')
    if html is None:
        return {'error': 'Failed to fetch YouTube page', 'success': False}

    song_count = extract_number_of_songs(html)

    if song_count > 0:
        html = remove_after_pattern(html)
        html = remove_before_pattern(html)
        ids = extract_unique_youtube_ids(html)
        video_details = get_video_details(ids)

        links = [f'https://www.youtube.com/watch?v={id}' for id in ids]
        return {'links': links, 'success': True, 'ids': ids, 'song_count': song_count, "video_details": video_details}
    else:
        return {'success': False}
    


@app.route('/', methods=['GET'])
def get_home_info():
    print("HOME ROUTE CALLED /")
    return str('hello backend')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)
