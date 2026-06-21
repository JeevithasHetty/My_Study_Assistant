from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas import (
    NoteCreate, NoteUpdate, NoteOut,
    NoteFolderCreate, NoteFolderOut,
    NoteAIRequest,
)
from app.services.groq_service import (
    generate_note_summary, generate_note_flashcards,
    generate_note_mcqs, generate_note_interview_qs,
    explain_note_topic, answer_from_note,
)

router = APIRouter(prefix="/notes", tags=["notes"])


# ── FOLDERS ──────────────────────────────────────────────────────────────────

@router.get("/folders", response_model=List[NoteFolderOut])
def get_folders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import NoteFolder
    return (
        db.query(NoteFolder)
        .filter(NoteFolder.user_id == current_user.id)
        .order_by(NoteFolder.created_at.asc())
        .all()
    )


@router.post("/folders", response_model=NoteFolderOut, status_code=201)
def create_folder(
    payload: NoteFolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import NoteFolder
    folder = NoteFolder(user_id=current_user.id, **payload.model_dump())
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@router.delete("/folders/{folder_id}")
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import NoteFolder, Note
    folder = db.query(NoteFolder).filter(
        NoteFolder.id == folder_id, NoteFolder.user_id == current_user.id
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    # Move notes to uncategorized (folder_id = null)
    db.query(Note).filter(Note.folder_id == folder_id).update({"folder_id": None})
    db.delete(folder)
    db.commit()
    return {"success": True}


# ── NOTES CRUD ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[NoteOut])
def get_notes(
    folder_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    q = db.query(Note).filter(Note.user_id == current_user.id)
    if folder_id is not None:
        q = q.filter(Note.folder_id == folder_id)
    if search:
        s = f"%{search}%"
        q = q.filter((Note.title.ilike(s)) | (Note.content.ilike(s)))
    if tag:
        q = q.filter(Note.tags.contains([tag]))
    return q.order_by(Note.updated_at.desc()).all()


@router.post("/", response_model=NoteOut, status_code=201)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = Note(user_id=current_user.id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"success": True}


@router.patch("/{note_id}/star")
def toggle_star(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.is_starred = not note.is_starred
    db.commit()
    return {"is_starred": note.is_starred}


# ── AI OPERATIONS ─────────────────────────────────────────────────────────────

@router.post("/{note_id}/ai/summarize")
def ai_summarize(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    result = generate_note_summary(note.content or note.title)
    return {"result": result, "action": "summarize"}


@router.post("/{note_id}/ai/flashcards")
def ai_flashcards(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    result = generate_note_flashcards(note.content or note.title)
    return {"result": result, "action": "flashcards"}


@router.post("/{note_id}/ai/mcqs")
def ai_mcqs(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    result = generate_note_mcqs(note.content or note.title)
    return {"result": result, "action": "mcqs"}


@router.post("/{note_id}/ai/interview-questions")
def ai_interview(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    result = generate_note_interview_qs(note.content or note.title)
    return {"result": result, "action": "interview_questions"}


@router.post("/{note_id}/ai/explain")
def ai_explain(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    result = explain_note_topic(note.content or note.title)
    return {"result": result, "action": "explain"}


@router.post("/{note_id}/ai/ask")
def ai_ask(
    note_id: int,
    payload: NoteAIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Note
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    result = answer_from_note(note.content or note.title, payload.question)
    return {"result": result, "action": "ask", "question": payload.question}
