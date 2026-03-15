from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.limiter import limiter
from app.models import User
from app.schemas import Token, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
@limiter.limit("10/minute")
def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)) -> User:
    """
    Username and email must be unique.
    Password is hashed with bcrypt before storage.
    """
    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username or email is already registered.",
        )
    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="User login (get JWT token)",
)
@limiter.limit("20/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    The `username` field accepts a username **or** email.
    Returns a JWT access token on success.
    """
    user: User | None = (
        db.query(User)
        .filter(
            (User.username == form_data.username)
            | (User.email == form_data.username)
        )
        .first()
    )

    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(access_token=create_access_token(user_id=user.id))


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user info",
)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
