from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date 

# USER SCHEMAS ---------------------------
class UserCreate(BaseModel):
    
    # EmailStr valdiates it's a real email format
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    # this tells Pydantic to read data from SQLAlchemy model attributes
    # without this, PYdantic wouldn't know how to read ORM objects
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# JOB SCHEMAS ----------------------------
class JobBase(BaseModel):
    company: str
    role: str
    status: str = "Wishlist"
    date_applied: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = None
    url: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None


class JobCreate(JobBase):
    # inherits all fields from JobBase
    # no extra fields needed on creation
    pass

class JobUpdate(BaseModel):
    # every field is option - PATCH means updatre only what's sent
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    date_applied: Optional[date] = None
    deadline: Optional[date] = None
    notes: Optional[str] = None
    url: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

class JobResponse(JobBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


# CLASS SCHEMAS --------------------------
class ContactBase(BaseModel):
    name: str
    role: Optional[str] = None
    outreach_method: str
    outreach_date: Optional[date] = None
    response_status: str = "no_response"
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    outreach_method: Optional[str] = None
    outreach_date: Optional[date] = None
    response_status: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    id: int
    job_id: int

    model_config = {"from_attributes": True}


# INTERVIEW SCHEMAS ---------------------
class InterviewBase(BaseModel):
    round: str
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None
    outcome: str = "pending"


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    round: Optional[str] = None
    scheduled_date: Optional[date] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None


class InterviewResponse(InterviewBase):
    id: int
    job_id: int

    model_config = {"from_attributes": True}