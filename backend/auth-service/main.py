from fastapi import FastAPI
import models
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Auth service is running"}