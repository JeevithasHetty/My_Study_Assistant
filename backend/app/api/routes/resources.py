from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, SavedResource

router = APIRouter(prefix="/resources", tags=["resources"])

# Static curated resource library
RESOURCES = [
    {"id": 1, "title": "Striver's A2Z DSA Course", "type": "course", "category": "DSA", "source": "YouTube", "rating": 4.9, "views": "2.1M", "desc": "Complete DSA from basics to advanced with 450+ problems", "tag": "Highly Recommended", "url": "https://takeuforward.org/strivers-a2z-dsa-course"},
    {"id": 2, "title": "System Design Primer", "type": "article", "category": "System Design", "source": "GitHub", "rating": 4.8, "views": "1.5M", "desc": "Comprehensive guide to system design for technical interviews", "tag": "Must Read", "url": "https://github.com/donnemartin/system-design-primer"},
    {"id": 3, "title": "Gate Smashers OS Playlist", "type": "video", "category": "OS", "source": "YouTube", "rating": 4.7, "views": "890K", "desc": "Operating systems concepts explained with examples and PYQs", "tag": "", "url": "https://youtube.com"},
    {"id": 4, "title": "LeetCode Top 150 Interview Questions", "type": "practice", "category": "DSA", "source": "LeetCode", "rating": 4.8, "views": "5M", "desc": "The most commonly asked interview questions at top companies", "tag": "Top Pick", "url": "https://leetcode.com/studyplan/top-interview-150"},
    {"id": 5, "title": "Jenny's DBMS Lectures", "type": "video", "category": "DBMS", "source": "YouTube", "rating": 4.6, "views": "600K", "desc": "DBMS from fundamentals to advanced SQL and normalization", "tag": "", "url": "https://youtube.com"},
    {"id": 6, "title": "InterviewBit Placement Guide", "type": "course", "category": "Placement", "source": "InterviewBit", "rating": 4.7, "views": "800K", "desc": "Curated prep path for product-based company placements", "tag": "Top Pick", "url": "https://interviewbit.com"},
    {"id": 7, "title": "Designing Data-Intensive Applications", "type": "book", "category": "System Design", "source": "O'Reilly", "rating": 5.0, "views": "200K", "desc": "The definitive book on building scalable and maintainable systems", "tag": "Classic", "url": "#"},
    {"id": 8, "title": "Build Full-Stack Projects (React + Node)", "type": "course", "category": "Projects", "source": "Udemy", "rating": 4.5, "views": "450K", "desc": "5 full-stack projects for your portfolio", "tag": "", "url": "#"},
    {"id": 9, "title": "Neso Academy Computer Networks", "type": "video", "category": "CN", "source": "YouTube", "rating": 4.7, "views": "700K", "desc": "Complete Computer Networks course with examples and animations", "tag": "", "url": "https://youtube.com"},
    {"id": 10, "title": "Abdul Bari Algorithms Course", "type": "video", "category": "DSA", "source": "YouTube", "rating": 4.9, "views": "3M", "desc": "Best algorithms course on YouTube — clear explanations with visualization", "tag": "Highly Recommended", "url": "https://youtube.com"},
    {"id": 11, "title": "Coding Ninjas DSA in Python", "type": "course", "category": "DSA", "source": "Coding Ninjas", "rating": 4.6, "views": "300K", "desc": "DSA with Python — from beginner to placement ready", "tag": "", "url": "#"},
    {"id": 12, "title": "Pramp — Mock Interviews", "type": "practice", "category": "Placement", "source": "Pramp", "rating": 4.7, "views": "500K", "desc": "Free peer-to-peer mock technical interviews with real engineers", "tag": "Must Try", "url": "https://pramp.com"},
]


def _saved_ids(user_id: int, db: Session) -> set:
    rows = db.query(SavedResource).filter(SavedResource.user_id == user_id).all()
    return {r.resource_id for r in rows}


@router.get("/")
def get_resources(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resources = [r.copy() for r in RESOURCES]
    if category and category != "All":
        resources = [r for r in resources if r["category"] == category]
    if search:
        s = search.lower()
        resources = [r for r in resources if s in r["title"].lower() or s in r["desc"].lower()]

    saved = _saved_ids(current_user.id, db)
    for r in resources:
        r["saved"] = r["id"] in saved
    return resources


@router.get("/ai-curated")
def get_ai_curated(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Resume
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id, Resume.is_analyzed == True)
        .order_by(Resume.created_at.desc())
        .first()
    )
    saved = _saved_ids(current_user.id, db)
    pool = RESOURCES
    if resume and resume.missing_skills:
        missing = set(s.lower() for s in resume.missing_skills)
        curated = [r for r in RESOURCES if any(m in r["title"].lower() or m in r["desc"].lower() for m in missing)]
        pool = curated[:6] or RESOURCES[:6]
    else:
        pool = RESOURCES[:6]
    result = [r.copy() for r in pool]
    for r in result:
        r["saved"] = r["id"] in saved
    return result


@router.post("/{resource_id}/save")
def save_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(SavedResource).filter(
        SavedResource.user_id == current_user.id,
        SavedResource.resource_id == resource_id,
    ).first()
    if not existing:
        db.add(SavedResource(user_id=current_user.id, resource_id=resource_id))
        db.commit()
    return {"saved": True}


@router.delete("/{resource_id}/save")
def unsave_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(SavedResource).filter(
        SavedResource.user_id == current_user.id,
        SavedResource.resource_id == resource_id,
    ).delete()
    db.commit()
    return {"saved": False}
