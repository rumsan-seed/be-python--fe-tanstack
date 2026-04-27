from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models.note import Note
from app.models.schemas import NoteCreate, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[Note])
def list_notes(db: Session = Depends(get_session)):
    return db.exec(select(Note).order_by(Note.updated_at.desc())).all()


@router.post("", response_model=Note, status_code=201)
def create_note(req: NoteCreate, db: Session = Depends(get_session)):
    note = Note(**req.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=Note)
def get_note(note_id: int, db: Session = Depends(get_session)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=Note)
def update_note(note_id: int, req: NoteUpdate, db: Session = Depends(get_session)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    data = req.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(note, key, value)
    note.updated_at = datetime.now(timezone.utc)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_session)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"deleted": True}
