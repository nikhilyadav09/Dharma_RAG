import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class DatabaseConfig:
    """Database configuration settings"""
    CONNECTION_PARAMS = {
        "dbname": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "host": os.getenv("DB_HOST"),
        "port": os.getenv("DB_PORT", "5432"),
    }

class LLMConfig:
    """LLM configuration settings"""
    API_KEY1 = os.getenv("LLM_API_KEY_1")
    API_KEY2 = os.getenv("LLM_API_KEY_2")
    API_KEY3 = os.getenv("LLM_API_KEY_3")
    MODEL_NAME = os.getenv("LLM_MODEL_NAME")
    MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", 500))
    TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.7))

class CacheConfig:
    """Cache configuration settings"""
    ENABLE_CACHE = os.getenv("CACHE_ENABLED", "True").lower() == "true"
    CACHE_EXPIRY = int(os.getenv("CACHE_EXPIRY", 3600))


class APIConfig:
    """FastAPI server configuration settings"""
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", "8000"))
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]