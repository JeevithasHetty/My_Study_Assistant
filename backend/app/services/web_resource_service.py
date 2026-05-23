import requests
from app.core.config import settings


def search_web_resources(topic):
    url = "https://www.googleapis.com/customsearch/v1"

    params = {
        "key": settings.GOOGLE_SEARCH_API_KEY,
        "cx": settings.GOOGLE_SEARCH_ENGINE_ID,
        "q": topic
    }

    response = requests.get(
        url,
        params=params
    )

    data = response.json()

    results = []

    if "items" in data:
        for item in data["items"][:3]:
            results.append({
                "title": item["title"],
                "url": item["link"]
            })

    return results