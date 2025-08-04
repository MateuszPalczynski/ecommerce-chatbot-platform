from starlette.config import Config

config = Config(".env") 

GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID", cast=str, default=None)
GOOGLE_CLIENT_SECRET = config("GOOGLE_CLIENT_SECRET", cast=str, default=None)

SESSION_SECRET_KEY = config("SESSION_SECRET_KEY", cast=str, default="Nta6DB21RaCTgvLJSJ2TyFPMxJakKqJI")
