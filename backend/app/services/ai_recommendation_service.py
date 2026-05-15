from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0"
)


def generate_ai_recommendations(context: str):
    prompt = f"""
You are an academic mentor and placement advisor.

Student context:
{context}

Generate:
1. Study recommendations
2. Placement preparation suggestions
3. Time management advice
4. Skill improvement suggestions
"""

    result = generator(
        prompt,
        max_new_tokens=200,
        do_sample=True,
        temperature=0.7
    )

    return result[0]["generated_text"]