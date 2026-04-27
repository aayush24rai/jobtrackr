import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from pathlib import Path

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
import models

load_dotenv()
#load_dotenv(Path(__file__).parent / ".env")

# read config from env
SECRET_KEY = os.getenv("SECRET_KEY")
assert SECRET_KEY, "SECRET_KEY environment variable is not set"

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

# CryptContext handles hashing - bcrypt is the algo
# deprecated auto means old hash formats get flagged automatically
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2PasswordBearer tells FastAPI where clients send their token
# tokenUrl is the endpoint that issues tokens - used by FastAPI's docs UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# PASSWORD HELPERS ----------------------
def hash_password(password: str) -> str:
    # turns "mypassword" to irreversible hash
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # hashes plain pwd and compares to stored hash
    # return true it they match false otherwise
    return pwd_context.verify(plain_password, hashed_password)


# TOKEN CREATION ------------------------
def create_access_token(user_id: int) -> str:
    # timezone.utc makes ther datetime timezone-aware - required by jose
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # the payload - "sub" is a standard JWT for the subject (who this token is for)
    # we store user_id as a string - JWT spec says sub should be a str
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access"  #this let's us distinguish access bs refresh tokens
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# TOKEN VERIFICATION -------------------
def verify_token(token: str, expected_type: str) -> Optional[int]:
    # returns user_id if valid, None if invalid or expired
    try: 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        #make sure it's the right token type
        if payload.get("type") != expected_type:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        return int(user_id)
    
    except JWTError:
        # JWTError covers expired tokens, invalid signatures, malformed tokens
        return None

# FASTAPI DEPENDENCY -------------------
def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
) -> models.User:
    
    # This function is a dependency — FastAPI calls it automatically
    # for any route that declares: current_user = Depends(get_current_user)
    
    # Define the error we'll raise if anything goes wrong
    # 401 Unauthorized with WWW-Authenticate header is the HTTP standard
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = verify_token(token, expected_type="access")
    if user_id is None:
        raise credentials_exception
    
    # Look up the user in the database
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user