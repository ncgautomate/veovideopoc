from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path


class Settings(BaseSettings):
    # API Key
    gemini_api_key: str

    # Server Configuration
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    video_storage_path: str = "./videos"
    max_file_size: int = 20 * 1024 * 1024  # 20MB

    # AI Model Configuration
    video_model: str = "veo-3.1-generate-preview"  # Veo 3.1 for video generation
    chat_model: str = "gemini-2.0-flash-exp"  # Gemini for chat
    optimize_model: str = "gemini-2.0-flash-exp"  # Gemini for prompt optimization

    class Config:
        # Look for .env file in backend directory
        env_file = str(Path(__file__).parent.parent / ".env")
        env_file_encoding = 'utf-8'
        # Ignore extra fields
        extra = 'ignore'


@lru_cache()
def get_settings():
    return Settings()
