from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    # this tells SQLAlchemy what to name the table in PostgreSQL
    __tablename__ = "users"

    #PostgreSQL auto-increments pk
    id = Column(Integer, primary_key=True, index=True)

    #index=True create a DB index - makes lookups by email fast
    email = Column(String, unique=True, index=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    #this is a SQLAlchemy relationship
    #it lets us do user.jobs to get all jobs for this user
    #back_populates means Job.owner navigates back to the user
    #cascade here mean if you delete a user all their jobs are automatically deleted too
    jobs = relationship("Job", back_populates="owner", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    #this is the value in our kanban column
    status = Column(String, default="Wishlist", nullable=False)
    date_applied = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    url = Column(String, nullable=True)

    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)

    owner = relationship("User", back_populates="jobs")

    contacts = relationship("Contact", back_populates="job", cascade="all, delete-orphan")

    interviews = relationship("Interview", back_populates="job", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    outreach_method = Column(String, nullable=False)
    outreach_date = Column(Date, nullable=True)
    response_status = Column(String, default="no_response" , nullable=True)
    follow_up_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    job = relationship("Job", back_populates="contacts")



class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    round = Column(String, nullable=False)
    scheduled_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    outcome = Column(String, default="pending", nullable=True)

    job = relationship("Job", back_populates="interviews")