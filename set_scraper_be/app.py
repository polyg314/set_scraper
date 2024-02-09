from flask import Flask, request, jsonify
import requests
import re
import psycopg2
from dotenv import load_dotenv
import os
from werkzeug.serving import run_simple
from flask_cors import CORS
from flask_cors import cross_origin
from flask_caching import Cache

from bs4 import BeautifulSoup





app = Flask(__name__)
CORS(app, supports_credentials=True)
load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
API_KEY = os.getenv('API_KEY')

cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300}) # 300 seconds = 5 minutes

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"

@app.route('/api/videos')
@cache.cached(timeout=300, query_string=True)  # Cache this route's response for 5 minutes
def get_videos():
    # channelId = request.args.get('channelId')
    # part = request.args.get('part', 'snippet')
    # maxResults = request.args.get('maxResults', 50)
    # order = request.args.get('order', 'date')
    # type = request.args.get('type', 'video')

    part='snippet'
    channelId='UCJOtExbMu0RqIdiE4nMUPxQ'
    maxResults=20
    order='date'
    type='video'
    key=API_KEY
    print("HIIII")
    # Construct the YouTube API request
    response = requests.get(
        YOUTUBE_API_URL,
        params={
            "part": part,
            "channelId": channelId,
            "maxResults": maxResults,
            "order": order,
            "type": type,
            "key": API_KEY,
        }
    )

    # Forward the response from YouTube API
    return jsonify(response.json())


# def extract_video_urls_from_metadata(html):
#     soup = BeautifulSoup(html, 'html.parser')
#     with open('yourfile.txt', 'w') as f:
#         f.write(soup.prettify())
#     print(soup)
#     content_renderer_sections = soup.find(attrs={'id':'bottom-row'})
#     print("MD")
#     print(content_renderer_sections)
#     urls = []
#     pattern = r'href="/watch\?v=([a-zA-Z0-9_-]+)"'
    
#     # for section in content_renderer_sections:
#     #     section_html = str(section)
#     #     matches = re.findall(pattern, section_html)
#     #     for match in matches:
#     #         url = f'https://www.youtube.com/watch?v={match}'
#     #         if url not in urls:
#     #             urls.append(url)

#     return urls


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
    # print("found")
    # print(found_video_ids)
    
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
    print("RB4")
    print(match)
    
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
    # ['gjZOiDVpS4U','YfwMgR0UDlk','WxQUQZh5kg0','oY9lifcROvU','ss61e73MWnM','699ExiHkOCg','PVEA2ovVM_U','_V-llw2kmBU','4b46uWsLxYc','4ykPvej9Zww']
    # music_section_header = '{"simpleText":"Music"},"subtitle":{"simpleText":"10 songs"}'

    if not reference_id:
        return jsonify({'error': 'No reference ID provided'}), 400

    html = get_html_from_url(f'https://www.youtube.com/watch?v={reference_id}')
    if html is None:
        return jsonify({'error': 'Failed to fetch YouTube page'}), 500

    # Example usage:
    # text_snippet = '{"simpleText":"Music"},"subtitle":{"simpleText":"10 songs"}'
    song_count =  extract_number_of_songs(html)
    if(song_count > 0):
        # song_count =   extract_number_of_songs(text_snippet)
        html = remove_after_pattern(html)
        html = remove_before_pattern(html)
        # print(html)
        ids = extract_unique_youtube_ids(html)
        print(ids)
        # print(html)

        links = [f'https://www.youtube.com/watch?v={id}' for id in ids]

        
        # video_urls = extract_video_urls_from_metadata(html)

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
    



# @app.route('/scrape_set', methods=['POST', 'OPTIONS'])
# @cross_origin()  # Enables CORS for this specific route
# def scrape_set():
#     # if request.method == 'OPTIONS':
#     #     return {}, 200
#     # print("scrape-set")
#     # print("HELLLLOoooo1111")
    
#     # print(request.jsonl.videoId)

#     video_id = request.json.get('videoId')

#     # reference_id = 'C1EzGpUCX44'
#     # ['gjZOiDVpS4U','YfwMgR0UDlk','WxQUQZh5kg0','oY9lifcROvU','ss61e73MWnM','699ExiHkOCg','PVEA2ovVM_U','_V-llw2kmBU','4b46uWsLxYc','4ykPvej9Zww']
#     # music_section_header = '{"simpleText":"Music"},"subtitle":{"simpleText":"10 songs"}'

#     if not video_id:
#         return jsonify({'error': 'No reference ID provided'}), 400

#     html = get_html_from_url(f'https://www.youtube.com/watch?v={video_id}')
#     if html is None:
#         return jsonify({'error': 'Failed to fetch YouTube page'}), 500

#     # Example usage:
#     # text_snippet = '{"simpleText":"Music"},"subtitle":{"simpleText":"10 songs"}'
#     song_count =  extract_number_of_songs(html)
#     if(song_count > 0):
#         # song_count =   extract_number_of_songs(text_snippet)
#         html = remove_after_pattern(html)
#         html = remove_before_pattern(html)
#         # print(html)
#         ids = extract_unique_youtube_ids(html)
#         print(ids)
#         # print(html)

#         links = [f'https://www.youtube.com/watch?v={id}' for id in ids]

        
#         # video_urls = extract_video_urls_from_metadata(html)

#         return jsonify({'links': links, 'success': True, 'ids': ids, 'song_count': song_count})

#     else:
#         return jsonify({'success' : False})


def create_connection():
    connection = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return connection

@app.route('/data', methods=['GET'])
def get_data():
    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM your_table_name')
        data = cursor.fetchall()
        cursor.close()
        connection.close()
        return str(data)
    except psycopg2.Error as error:
        return str(error)

@app.route('/', methods=['GET'])
def get_home_info():
    try:
        connection = create_connection()
        cursor = connection.cursor()
        # cursor.execute('SELECT * FROM your_table_name')
        cursor.close()
        connection.close()
        return str('hello backend')
    except psycopg2.Error as error:
        return str(error)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
    # app.debug = True  # Enable debug mode for automatic reloading
    # run_simple('localhost', 5000, app, use_reloader=True)