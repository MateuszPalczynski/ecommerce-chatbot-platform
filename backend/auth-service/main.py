from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
import os

from config import SESSION_SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
import models
import schemas
import security
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)

# --- OAuth2 client setup ---
oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Serwer dziala i polaczyl sie z baza danych."}

@app.get('/login/google')
async def login_via_google(request: Request):
    redirect_uri = request.url_for('auth_via_google')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/auth/google', response_model=schemas.Token)
async def auth_via_google(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        print(f"Authlib returned an error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not get token from Google")


    user_info = await oauth.google.parse_id_token(request, token)
    user_email = user_info.get('email')
    user_name = user_info.get('name')

    db_user = db.query(models.User).filter(models.User.email == user_email).first()

    if not db_user:
        new_user = models.User(email=user_email, full_name=user_name, hashed_password=None)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db_user = new_user

    access_token = security.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

@app.post("/login/jwt", response_model=schemas.Token)
def login_for_access_token(login_data: schemas.LoginData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.username).first()
    if not user or not user.hashed_password or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}