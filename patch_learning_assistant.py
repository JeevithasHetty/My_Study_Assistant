from pathlib import Path
files = [
    Path('backend/app/services/learning_assistant_service.py'),
    Path('backend/app/schemas/learning_assistant_service.py')
]
old = '''    prompt = f"""
You are an expert academic mentor.

Topic:
{topic}

Return ONLY valid JSON:

{
    "explanation":"simple explanation",
    "practice_questions":[
        "q1",
        "q2",
        "q3"
    ],
    "interview_questions":[
        "i1",
        "i2",
        "i3"
    ]
}
"""
'''
new = '''    prompt = f"""
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
'''
for path in files:
    text = path.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Old prompt not found in {path}')
    path.write_text(text.replace(old, new), encoding='utf-8')
    print(f'Updated {path}')
