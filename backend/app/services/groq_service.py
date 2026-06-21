from groq import Groq
from app.core.config import settings
import json

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


def chat(system_prompt: str, user_message: str, max_tokens: int = 2048) -> str:
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"AI service error: {str(e)}"


def chat_json(system_prompt: str, user_message: str, max_tokens: int = 2048) -> dict:
    system_prompt = system_prompt + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no backticks."
    raw = chat(system_prompt, user_message, max_tokens)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip().rstrip("```").strip()
    try:
        return json.loads(raw)
    except Exception:
        return {}


# ─── DOCUMENT SERVICES ───────────────────────────────────────────────────────

def generate_summary(text: str) -> str:
    system = """You are an expert academic summarizer. Create a clear, comprehensive
    summary of the given document content. Focus on key ideas, concepts, and important
    details. Write in clear, student-friendly language."""
    return chat(system, f"Summarize this document:\n\n{text[:8000]}")


def generate_concepts(text: str) -> list:
    system = """You are an expert educator. Extract the key concepts from this document.
    Return a JSON array of strings, each being a key concept (short phrase, max 6 words).
    Return between 6 and 12 concepts."""
    result = chat_json(system, f"Extract key concepts from:\n\n{text[:6000]}")
    if isinstance(result, list):
        return result
    return result.get("concepts", [])


def generate_flashcards(text: str) -> list:
    system = """You are a flashcard generator. Create educational flashcards from the content.
    Return a JSON array of objects with exactly this structure:
    [{"front": "question or term", "back": "answer or definition"}, ...]
    Generate between 8 and 15 flashcards."""
    result = chat_json(system, f"Generate flashcards from:\n\n{text[:6000]}")
    if isinstance(result, list):
        return result
    return result.get("flashcards", [])


def generate_mcqs(text: str) -> list:
    system = """You are a quiz generator. Create multiple choice questions from the content.
    Return a JSON array with this structure:
    [{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": 0, "explanation": "..."}]
    correct_answer is the index (0-3) of the correct option.
    Generate between 5 and 8 MCQs."""
    result = chat_json(system, f"Generate MCQs from:\n\n{text[:6000]}")
    if isinstance(result, list):
        return result
    return result.get("questions", result.get("mcqs", []))


def answer_question(text: str, question: str) -> str:
    system = """You are a helpful AI tutor. Answer the student's question based ONLY on
    the provided document content. Be clear, concise, and educational."""
    return chat(system, f"Document:\n{text[:6000]}\n\nQuestion: {question}")


# ─── RESUME SERVICES ─────────────────────────────────────────────────────────

def analyze_resume(resume_text: str) -> dict:
    system = """You are an expert ATS resume analyzer and career coach.
    Analyze the resume and return a JSON object with this exact structure:
    {
      "ats_score": <integer 0-100>,
      "present_skills": ["skill1", "skill2", ...],
      "missing_skills": ["skill1", "skill2", ...],
      "suggestions": [
        {"type": "error|warning|success", "text": "suggestion text"},
        ...
      ],
      "job_matches": [
        {"company": "CompanyName", "role": "Role Title", "match": <int 0-100>},
        ...
      ],
      "section_scores": {
        "keywords_match": <int>,
        "format_structure": <int>,
        "action_verbs": <int>,
        "quantified_results": <int>,
        "contact_information": <int>
      }
    }
    Provide 5-6 job matches with realistic scores based on the resume content.
    Be realistic with the ATS score."""
    return chat_json(system, f"Analyze this resume:\n\n{resume_text[:5000]}")


def compare_resume_jd(resume_text: str, job_description: str) -> dict:
    system = """You are a resume-JD matching expert. Compare the resume against the job description.
    Return JSON: {"match_score": <int>, "matching_skills": [], "missing_skills": [], "recommendations": []}"""
    return chat_json(system, f"Resume:\n{resume_text[:3000]}\n\nJob Description:\n{job_description[:2000]}")


def generate_career_roadmap(resume_text: str, target_role: str = "Software Engineer") -> dict:
    system = """You are a career coach. Generate a career roadmap based on the resume.
    Return JSON: {"phases": [{"phase": "Phase 1", "duration": "2 weeks", "focus": "...", "tasks": ["task1", "task2"]}]}"""
    return chat_json(system, f"Resume:\n{resume_text[:3000]}\n\nTarget Role: {target_role}")


# ─── PLACEMENT SERVICES ───────────────────────────────────────────────────────

def get_placement_readiness(user_data: dict) -> dict:
    system = """You are a placement readiness evaluator. Based on the student's profile,
    compute readiness scores. Return JSON:
    {
      "overall_score": <int 0-100>,
      "completed_skills": [{"name": "skill", "level": <int>}],
      "missing_skills": [{"skill": "name", "current_level": <int>, "required_level": <int>, "priority": "critical|high|medium|low"}],
      "company_readiness": [{"company": "Name", "role": "Role", "match": <int>, "tier": "Target|Reach|Stretch|Dream"}]
    }"""
    return chat_json(system, f"Student profile: {json.dumps(user_data)}")


def get_skill_gaps(user_data: dict) -> list:
    system = """Identify skill gaps for a software engineering student. Return a JSON array:
    [{"skill": "name", "current_level": <int>, "required_level": <int>, "priority": "critical|high|medium|low"}]
    Focus on the most critical gaps for placement."""
    result = chat_json(system, f"Student profile: {json.dumps(user_data)}")
    if isinstance(result, list):
        return result
    return result.get("gaps", result.get("skill_gaps", []))


def get_placement_roadmap(user_data: dict) -> dict:
    system = """Create a placement preparation roadmap. Return JSON:
    {"phases": [{"phase": "Phase 1 — Now", "duration": "2 weeks", "focus": "...", "tasks": ["task"], "status": "active|upcoming"}]}
    Create 4-6 phases covering DSA, System Design, Mock Interviews, and Company-specific prep."""
    return chat_json(system, f"Student profile: {json.dumps(user_data)}")


def placement_ai_chat(message: str, user_context: dict) -> str:
    system = f"""You are an expert placement coach and career mentor for engineering students.
    Student context: {json.dumps(user_context)}
    Give specific, actionable advice. Be encouraging but realistic.
    Keep responses concise (3-5 sentences max)."""
    return chat(system, message, max_tokens=512)


# ─── DASHBOARD SERVICES ───────────────────────────────────────────────────────

def get_ai_recommendations(user_data: dict) -> list:
    system = """You are an AI academic coach. Generate personalized daily recommendations.
    Return a JSON array of 3-5 recommendations:
    [{"type": "study|placement|resume|exam", "title": "...", "description": "...", "priority": "high|medium|low"}]"""
    result = chat_json(system, f"Student data: {json.dumps(user_data)}")
    if isinstance(result, list):
        return result
    return result.get("recommendations", [])


# ─── STUDY PLANNER SERVICES ──────────────────────────────────────────────────

def generate_weekly_plan(user_data: dict, exams: list) -> dict:
    system = """You are a study planner. Create a weekly study plan.
    Return JSON: {"plan": [{"day": "Monday", "sessions": [{"subject": "...", "duration": 2, "focus": "..."}]}]}"""
    return chat_json(system, f"Student: {json.dumps(user_data)}\nExams: {json.dumps(exams[:5])}")


# ─── NOTES AI SERVICES ───────────────────────────────────────────────────────

def generate_note_summary(content: str) -> str:
    system = """You are an expert note summarizer for students. Create a concise but
    comprehensive summary of the note content. Highlight the key points, definitions,
    formulas, and concepts. Use clear formatting with bullet points where appropriate."""
    return chat(system, f"Summarize these notes:\n\n{content[:5000]}")


def generate_note_flashcards(content: str) -> list:
    system = """Create educational flashcards from these notes.
    Return a JSON array: [{"front": "term or question", "back": "definition or answer"}]
    Generate 8-12 high-quality flashcards covering the key concepts."""
    result = chat_json(system, f"Notes content:\n\n{content[:5000]}")
    if isinstance(result, list):
        return result
    return result.get("flashcards", [])


def generate_note_mcqs(content: str) -> list:
    system = """Create MCQ quiz questions from these student notes.
    Return JSON array: [{"question": "...", "options": ["A","B","C","D"], "correct_answer": 0, "explanation": "..."}]
    Generate 5-8 questions. correct_answer is the index (0-3)."""
    result = chat_json(system, f"Notes:\n\n{content[:5000]}")
    if isinstance(result, list):
        return result
    return result.get("questions", [])


def generate_note_interview_qs(content: str) -> list:
    system = """Generate technical interview questions based on these notes.
    Return a JSON array of strings — each is an interview question.
    Focus on conceptual understanding, problem-solving, and application.
    Generate 8-10 questions ranging from basic to advanced."""
    result = chat_json(system, f"Notes:\n\n{content[:5000]}")
    if isinstance(result, list):
        return result
    return result.get("questions", [])


def explain_note_topic(content: str) -> str:
    system = """You are an expert teacher. Explain the topic in these notes in simple,
    clear language. Use analogies and examples to make it easy to understand.
    Start with the big picture, then dive into specifics."""
    return chat(system, f"Explain the topic in these notes:\n\n{content[:5000]}")


def answer_from_note(content: str, question: str) -> str:
    system = """You are a helpful AI study assistant. Answer the student's question
    based on their notes. Be specific and reference the content from the notes.
    If the answer isn't in the notes, say so and provide a general answer."""
    return chat(system, f"Notes:\n{content[:4000]}\n\nQuestion: {question}")


# ─── LEARNING ASSISTANT SERVICES ─────────────────────────────────────────────

def explain_topic(topic: str, difficulty: str = "medium", context: str = "") -> str:
    system = f"""You are an expert CS/Engineering tutor. Explain topics clearly to students.
    Difficulty level: {difficulty}. {'Context: ' + context if context else ''}
    Use clear structure: definition → intuition → example → key points.
    Include code examples where relevant. Be thorough but approachable."""
    return chat(system, f"Explain this topic thoroughly: {topic}", max_tokens=1500)


def generate_practice_questions(topic: str, difficulty: str = "medium") -> list:
    system = f"""Generate {difficulty}-level practice questions for engineering/CS students.
    Return JSON array: [{{"question": "...", "hint": "...", "answer": "...", "type": "conceptual|coding|numerical"}}]
    Generate 6-8 varied questions covering different aspects of the topic."""
    result = chat_json(system, f"Generate practice questions for: {topic}")
    if isinstance(result, list):
        return result
    return result.get("questions", [])


def generate_interview_questions(topic: str) -> list:
    system = """Generate technical interview questions for software engineering candidates.
    Include FAANG-style questions. Return JSON array:
    [{"question": "...", "difficulty": "easy|medium|hard", "type": "conceptual|coding|design", "expected_answer": "..."}]
    Generate 8-10 questions."""
    result = chat_json(system, f"Generate interview questions for: {topic}")
    if isinstance(result, list):
        return result
    return result.get("questions", [])


def get_related_topics(topic: str) -> list:
    system = """List related topics a student should learn after studying this topic.
    Return JSON array: [{"topic": "...", "reason": "...", "priority": "essential|recommended|optional"}]
    Return 8-10 related topics in learning order."""
    result = chat_json(system, f"Related topics for: {topic}")
    if isinstance(result, list):
        return result
    return result.get("topics", [])


def get_topic_career_relevance(topic: str, target_role: str, branch: str) -> dict:
    system = """Explain the career relevance of a CS/Engineering topic.
    Return JSON: {
      "relevance_score": <int 0-100>,
      "used_in_companies": ["company1", ...],
      "interview_frequency": "very common|common|occasional|rare",
      "career_paths": ["path1", ...],
      "real_world_applications": ["application1", ...],
      "salary_impact": "high|medium|low",
      "summary": "brief explanation"
    }"""
    return chat_json(system, f"Topic: {topic}\nTarget role: {target_role}\nBranch: {branch}")


# ─── CAREER COACH MULTI-AGENT SYSTEM ─────────────────────────────────────────

AGENT_PROMPTS = {
    "resume_analyst": """You are the Resume Analyst Agent for StudentOS AI.
    Specialization: ATS analysis, resume parsing, skill gap detection, job matching.
    Be specific, data-driven, and actionable. Focus on concrete improvements.""",

    "placement_mentor": """You are the Placement Mentor Agent for StudentOS AI.
    Specialization: Placement readiness assessment, career guidance, company-specific advice.
    Give realistic assessments and structured improvement plans.""",

    "study_planner": """You are the Study Planner Agent for StudentOS AI.
    Specialization: Daily/weekly study plans, exam planning, time optimization.
    Create practical, time-blocked study schedules tailored to the student.""",

    "learning_assistant": """You are the Learning Assistant Agent for StudentOS AI.
    Specialization: Concept explanation, practice problems, interview prep.
    Adapt your teaching style to the student's learning preferences.""",

    "resource_agent": """You are the Resource Recommendation Agent for StudentOS AI.
    Specialization: Curating the best YouTube channels, documentation, courses, and books.
    Recommend specific, high-quality resources matched to skill gaps.""",

    "document_tutor": """You are the Document Tutor Agent for StudentOS AI.
    Specialization: PDF understanding, document summarization, Q&A, topic extraction.
    Help students extract maximum value from their study materials.""",

    "career_coach": """You are the Career Coach — the manager agent of StudentOS AI's 7-agent system.
    You coordinate all other agents and synthesise their insights into holistic career guidance.
    Provide strategic, big-picture advice on academic and career success.""",
}


def run_career_coach_agents(context: dict) -> dict:
    """Run all 7 agents and return aggregated dashboard insights."""
    ctx_str = json.dumps(context)

    # Agent 1: Resume Analyst
    resume_insight = chat_json(
        AGENT_PROMPTS["resume_analyst"] + "\nReturn JSON: {\"status\": \"...\", \"ats_assessment\": \"...\", \"top_priority\": \"...\", \"skill_gaps\": [\"skill1\",\"skill2\",\"skill3\"], \"next_action\": \"...\"}",
        f"Student context: {ctx_str}",
        max_tokens=600,
    )

    # Agent 2: Placement Mentor
    placement_insight = chat_json(
        AGENT_PROMPTS["placement_mentor"] + "\nReturn JSON: {\"readiness_level\": \"...\", \"placement_score\": <int>, \"target_companies\": [\"c1\",\"c2\"], \"improvement_areas\": [\"area1\",\"area2\"], \"next_action\": \"...\"}",
        f"Student context: {ctx_str}",
        max_tokens=600,
    )

    # Agent 3: Study Planner
    study_insight = chat_json(
        AGENT_PROMPTS["study_planner"] + "\nReturn JSON: {\"daily_goal_hours\": <int>, \"focus_subjects\": [\"s1\",\"s2\"], \"weekly_plan_summary\": \"...\", \"next_action\": \"...\"}",
        f"Student context: {ctx_str}",
        max_tokens=600,
    )

    # Agent 4: Learning Assistant
    learning_insight = chat_json(
        AGENT_PROMPTS["learning_assistant"] + "\nReturn JSON: {\"recommended_topics\": [\"t1\",\"t2\",\"t3\"], \"learning_style_tip\": \"...\", \"next_topic\": \"...\", \"next_action\": \"...\"}",
        f"Student context: {ctx_str}",
        max_tokens=600,
    )

    # Agent 5: Resource Agent
    resource_insight = chat_json(
        AGENT_PROMPTS["resource_agent"] + "\nReturn JSON: {\"top_resources\": [{\"name\": \"...\", \"type\": \"...\", \"reason\": \"...\"}], \"next_action\": \"...\"}",
        f"Student context: {ctx_str}",
        max_tokens=600,
    )

    # Manager: Career Coach synthesises
    coach_summary = chat_json(
        AGENT_PROMPTS["career_coach"] + "\nReturn JSON: {\"overall_assessment\": \"...\", \"weekly_goals\": [\"goal1\",\"goal2\",\"goal3\"], \"career_trajectory\": \"...\", \"priority_action\": \"...\", \"motivation_message\": \"...\"}",
        f"Student context: {ctx_str}\n\nAgent insights: resume={json.dumps(resume_insight)}, placement={json.dumps(placement_insight)}, study={json.dumps(study_insight)}",
        max_tokens=800,
    )

    return {
        "agents": {
            "resume_analyst": {
                "name": "Resume Analyst",
                "status": "active",
                "icon": "FileText",
                "color": "blue",
                "insight": resume_insight,
            },
            "placement_mentor": {
                "name": "Placement Mentor",
                "status": "active",
                "icon": "Target",
                "color": "purple",
                "insight": placement_insight,
            },
            "study_planner": {
                "name": "Study Planner",
                "status": "active",
                "icon": "Calendar",
                "color": "green",
                "insight": study_insight,
            },
            "learning_assistant": {
                "name": "Learning Assistant",
                "status": "active",
                "icon": "BookOpen",
                "color": "cyan",
                "insight": learning_insight,
            },
            "resource_agent": {
                "name": "Resource Agent",
                "status": "active",
                "icon": "Video",
                "color": "red",
                "insight": resource_insight,
            },
            "document_tutor": {
                "name": "Document Tutor",
                "status": "standby",
                "icon": "FileSearch",
                "color": "amber",
                "insight": {"next_action": "Upload a PDF to activate"},
            },
            "career_coach": {
                "name": "Career Coach",
                "status": "active",
                "icon": "Brain",
                "color": "pink",
                "is_manager": True,
                "insight": coach_summary,
            },
        },
        "summary": coach_summary,
    }


def career_coach_chat(message: str, agent: str, context: dict) -> str:
    prompt = AGENT_PROMPTS.get(agent, AGENT_PROMPTS["career_coach"])
    system = f"{prompt}\n\nStudent context: {json.dumps(context)}\nGive specific, actionable advice in 3-5 sentences."
    return chat(system, message, max_tokens=512)


def generate_weekly_goals(context: dict) -> dict:
    system = """Generate a focused weekly goal plan for the student.
    Return JSON: {
      "week_theme": "...",
      "goals": [{"goal": "...", "category": "study|placement|resume|skills", "target": "...", "priority": "high|medium|low"}],
      "daily_focus": [{"day": "Monday", "focus": "...", "hours": <int>}]
    }
    Generate 5-7 goals and a full week schedule."""
    return chat_json(system, f"Student context: {json.dumps(context)}", max_tokens=1000)


def generate_skill_roadmap(context: dict) -> dict:
    system = """Create a comprehensive skill development roadmap.
    Return JSON: {
      "current_level": "beginner|intermediate|advanced",
      "target_level": "intermediate|advanced|expert",
      "estimated_weeks": <int>,
      "phases": [
        {"phase": "Phase 1", "weeks": 2, "skills": ["s1","s2"], "milestones": ["m1"], "resources": ["r1"]}
      ]
    }
    Create 4-6 phases."""
    return chat_json(system, f"Student context: {json.dumps(context)}", max_tokens=1200)


def plan_exam_schedule(
    exam_date: str,
    syllabus_size: int,
    available_hours: float,
    importance: str,
    user_context: dict,
) -> dict:
    system = """You are a Smart Exam Planner Agent. Create an optimal exam preparation schedule.
    Return JSON: {
      "recommended_start_date": "YYYY-MM-DD",
      "total_study_hours": <int>,
      "daily_hours": <float>,
      "priority": "critical|high|medium|low",
      "preparation_timeline": [
        {"week": 1, "focus": "...", "topics": ["t1","t2"], "hours": <int>, "milestone": "..."}
      ],
      "study_techniques": ["technique1", "technique2"],
      "day_before_tips": ["tip1", "tip2", "tip3"]
    }"""
    msg = f"""Exam date: {exam_date}
Syllabus topics count: {syllabus_size}
Available hours per day: {available_hours}
Importance: {importance}
Student: {json.dumps(user_context)}"""
    return chat_json(system, msg, max_tokens=1200)
