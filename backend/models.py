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
    notes = Column(Text, nullable=True)
    url = Column(String, nullable=True)

    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)

    owner = relationship("User", back_populates="jobs")