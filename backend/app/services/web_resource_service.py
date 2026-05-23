import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def search_web_resources(topic):
    prompt = f"""
You are a technical learning assistant.

For this learning topic:

{topic}

Generate 3 highly relevant learning resources.

Rules:
1. Prefer official documentation
2. Prefer trusted learning platforms
3. No fake URLs
4. Return ONLY JSON

Format:

[
  {{
    "title": "Resource Name",
    "url": "https://..."
  }}
]
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "Generate real learning resource URLs."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=500
        )

        content = response.choices[0].message.content

        return json.loads(content)

    except Exception as e:
        print("Docs resource error:", e)
        return []