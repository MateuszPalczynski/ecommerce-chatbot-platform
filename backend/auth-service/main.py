from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware 
from config import SESSION_SECRET_KEY

import models
import schemas
import security
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Włączamy middleware do obsługi sesji
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Serwer dziala i polaczyl sie z baza danych."}

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