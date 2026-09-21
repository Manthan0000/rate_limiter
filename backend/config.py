import os
from pydantic_settings import BaseSettings if hasattr(__import__('pydantic'), 'BaseSettings') else object

class Settings:
    PROJECT_NAME: str = "Protected Backend API"
    HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    PORT: int = int(os.getenv("BACKEND_PORT", "8001"))

settings = Settings()
