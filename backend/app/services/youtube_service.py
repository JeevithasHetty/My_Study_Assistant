from googleapiclient.discovery import build
from app.core.config import settings


def search_youtube(topic):
    youtube = build(
        "youtube",
        "v3",
        developerKey=settings.YOUTUBE_API_KEY
    )

    request = youtube.search().list(
        q=topic,
        part="snippet",
        maxResults=3,
        type="video"
    )

    response = request.execute()

    results = []

    for item in response["items"]:
        video_id = item["id"]["videoId"]

        results.append({
            "title": item["snippet"]["title"],
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })

    return results