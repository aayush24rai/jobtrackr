from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
import models
import schemas

# read-only views across all of a user's jobs, for the Calendar and Insights tabs
# (the per-job endpoints in jobs.py would need two requests per job)
router = APIRouter()


@router.get("/contacts", response_model=List[schemas.ContactResponse])
def get_all_contacts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # join through jobs so users only ever see contacts on their own jobs
    return db.query(models.Contact).join(models.Job).filter(
        models.Job.user_id == current_user.id
    ).all()


@router.get("/interviews", response_model=List[schemas.InterviewResponse])
def get_all_interviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Interview).join(models.Job).filter(
        models.Job.user_id == current_user.id
    ).all()
