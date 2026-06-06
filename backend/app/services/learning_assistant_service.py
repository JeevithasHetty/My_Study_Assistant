import json

from groq import Groq

from app.core.settings import settings


client = Groq(
    api_key=settings.GROQ_API_KEY
)


def get_topic_help(topic):

    prompt = f"""
You are an expert academic mentor.

Explain the following topic:

{topic}

Generate REAL content.

Return ONLY JSON in this format:

{
    "explanation":"Detailed beginner-friendly explanation",
    "practice_questions":[
        "...",
        "...",
        "..."
    ],
    "interview_questions":[
        "...",
        "...",
        "..."
    ]
}

Do not use placeholder values such as q1, q2, i1, i2, or 'simple explanation'.
"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=1000
    )

    result = json.loads(
        response.choices[0].message.content
    )

    return result
