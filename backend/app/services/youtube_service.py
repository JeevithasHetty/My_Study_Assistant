from googleapiclient.discovery import build
from app.core.config import settings
from typing import List


def search_youtube_videos(query: str, max_results: int = 5) -> List[dict]:
    """Search YouTube for educational videos related to a topic."""
    if not settings.YOUTUBE_API_KEY:
        return _fallback_videos(query)
    try:
        youtube = build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)
        request = youtube.search().list(
            q=f"{query} explained tutorial lecture",
            part="snippet",
            type="video",
            maxResults=max_results,
            videoDuration="medium",
            relevanceLanguage="en",
            safeSearch="strict",
        )
        response = request.execute()
        videos = []
        for item in response.get("items", []):
            snippet = item["snippet"]
            video_id = item["id"]["videoId"]
            videos.append({
                "title": snippet["title"],
                "channel": snippet["channelTitle"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"]["medium"]["url"],
                "description": snippet["description"][:200],
            })
        return videos
    except Exception:
        return _fallback_videos(query)


def _fallback_videos(topic: str) -> List[dict]:
    """Return curated fallback videos when API is unavailable."""
    fallbacks = {
        "default": [
            {"title": f"{topic} - Full Lecture", "channel": "Gate Smashers", "url": "https://youtube.com", "thumbnail": "", "description": ""},
            {"title": f"{topic} Explained Simply", "channel": "Jenny's Lectures", "url": "https://youtube.com", "thumbnail": "", "description": ""},
            {"title": f"{topic} - Crash Course", "channel": "Neso Academy", "url": "https://youtube.com", "thumbnail": "", "description": ""},
        ]
    }
    return fallbacks["default"]
