import requests


OLLAMA_URL = "http://localhost:11434/api/generate"


def analyze_resume(
    resume_text: str,
    placement_target: str
):
    prompt = f"""
You are an expert ATS and placement coach.

Target Role:
{placement_target}

Resume Content:
{resume_text}

Analyze and provide:

1. ATS score out of 100
2. Missing technical skills
3. Missing keywords
4. Weak project areas
5. Resume improvement suggestions
6. 30-day placement roadmap
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "phi3:mini",
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )

        data = response.json()

        if "response" in data:
            return data["response"]

        elif "error" in data:
            return f"Ollama Error: {data['error']}"

        else:
            return f"Unexpected response: {data}"

    except Exception as e:
        return f"Resume AI failed: {str(e)}"