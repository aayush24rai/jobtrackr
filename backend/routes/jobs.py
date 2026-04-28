from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter()


# HELPER --------------------

def get_job_or_404(job_id: int, user_id: int, db: Session) -> models.Job:
    # reusable helper - gets a job and verifies ownership in one query
    # raises 404 if not found or doesn't belong to this user
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.user_id == user_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job



# JOB CRUD ------------------

@router.get("/", response_model=List[schemas.JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    #return all jobs for the logged-in user only
    return db.query(models.Job).filter(
        models.Job.user_id == current_user.id
    ).all()


@router.post("/", response_model=schemas.JobResponse, status_code=201)
def create_job(
    job_data: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
): 
    new_job = models.Job(
        **job_data.model_dump(),    #unpacks all fields from the Pydantic schema
        user_id = current_user.id   #attach to the logged-in user
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return get_job_or_404(job_id, current_user.id, db)



@router.patch("/{job_id}", response_model=schemas.JobResponse)
def update_job(
    job_id: int,
    job_data: schemas.JobUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = get_job_or_404(job_id, current_user.id, db)

    # model_dump(exclude_unset=True) only returns fields the client actually sent
    # Without this, every unset field would overwrite existing data with None
    update_data = job_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job = get_job_or_404(job_id, current_user.id, db)
    db.delete(job)
    db.commit()
    # 204 No Content — successful delete returns no body


# CONTACTS ----------------------

@router.post("/{job_id}/contacts", response_model=schemas.ContactResponse, status_code=201)
def add_contact(
    job_id: int,
    contact_data: schemas.ContactCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)  # verify job ownership
    contact = models.Contact(**contact_data.model_dump(), job_id=job_id)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/{job_id}/contacts", response_model=List[schemas.ContactResponse])
def get_contacts(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)
    return db.query(models.Contact).filter(
        models.Contact.job_id == job_id
    ).all()


@router.patch("/{job_id}/contacts/{contact_id}", response_model=schemas.ContactResponse)
def update_contact(
    job_id: int,
    contact_id: int,
    contact_data: schemas.ContactUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)
    contact = db.query(models.Contact).filter(
        models.Contact.id == contact_id,
        models.Contact.job_id == job_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for field, value in contact_data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{job_id}/contacts/{contact_id}", status_code=204)
def delete_contact(
    job_id: int,
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)
    contact = db.query(models.Contact).filter(
        models.Contact.id == contact_id,
        models.Contact.job_id == job_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()


# INTERVIEWS ------------------------

@router.post("/{job_id}/interviews", response_model=schemas.InterviewResponse, status_code=201)
def add_interview(
    job_id: int,
    interview_data: schemas.InterviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)
    interview = models.Interview(**interview_data.model_dump(), job_id=job_id)
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.patch("/{job_id}/interviews/{interview_id}", response_model=schemas.InterviewResponse)
def update_interview(
    job_id: int,
    interview_id: int,
    interview_data: schemas.InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.job_id == job_id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    for field, value in interview_data.model_dump(exclude_unset=True).items():
        setattr(interview, field, value)

    db.commit()
    db.refresh(interview)
    return interview


@router.delete("/{job_id}/interviews/{interview_id}", status_code=204)
def delete_interview(
    job_id: int,
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    get_job_or_404(job_id, current_user.id, db)
    interview = db.query(models.Interview).filter(
        models.Interview.id == interview_id,
        models.Interview.job_id == job_id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(interview)
    db.commit()