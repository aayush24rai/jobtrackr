from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth

# APIRouter groups these endpoints together
# they'll be mounted at /auth in main.py
router = APIRouter()

@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # user_data is automatically validate by Pydantic - if email or pwd is missing or malformed FASTAPI returns 422 before this code runs

    # check if emaiul is already registered
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already reigstered"
        )
    
    # hash the pwd
    hashed = auth.hash_password(user_data.password)

    # create the User ORM object 
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed
    )


    # add to session and comit - writes the row to PostgreSQL
    db.add(new_user)
    db.commit()


    # refresh loads the auto-generated id back into new_user
    db.refresh(new_user)

    # issue tokens for the new user so they're logged in immediately
    access_token = auth.create_access_token(new_user.id)
    refresh_token = auth.create_refresh_token(new_user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserCreate, db: Session = Depends(get_db)):

    # look up user by email
    user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    #verify pwd - we use the same error for both "user not found" and "wrong pwd" intentionally so attackerrs don't know which one failed
    if not user or not auth.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = auth.create_access_token(user.id)
    refresh_token = auth.create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }



@router.post("/refresh", response_model=schemas.Token)
def refresh_token(payload: dict, db: Session = Depends(get_db)):

    #client sends: {"refresh_token": "..."}
    token = payload.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    
    # verify_token checks signature, expiry, and that type == "refresh"
    user_id = auth.verify_token(token, expected_type="refresh")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


    # make sure user still exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "access_token": auth.create_access_token(user.id),
        "refresh_token": auth.create_refresh_token(user.id),
        "token_type": "bearer"
    }


