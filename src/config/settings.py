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
    if os.getenv("DB_SSLMODE"):
        CONNECTION_PARAMS["sslmode"] = os.getenv("DB_SSLMODE")

class LLMConfig:
    """LLM configuration settings"""
    API_KEY1 = os.getenv("LLM_API_KEY_1")
    API_KEY2 = os.getenv("LLM_API_KEY_2")
    API_KEY3 = os.getenv("LLM_API_KEY_3")
    MODEL_NAME = os.getenv("LLM_MODEL_NAME", "llama-3.3-70b-versatile")
    MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", 900))
    TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.5))

class RAGConfig:
    """Retrieval and generation tuning parameters"""
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
    EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))
    SEMANTIC_WEIGHT = float(os.getenv("SEMANTIC_WEIGHT", "0.65"))
    BM25_WEIGHT = float(os.getenv("BM25_WEIGHT", "0.35"))
    TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "5"))
    CANDIDATE_POOL = int(os.getenv("RETRIEVAL_CANDIDATES", "12"))
    CONTEXT_VERSES = int(os.getenv("CONTEXT_VERSES", "3"))
    SEMANTIC_THRESHOLD = float(os.getenv("SEMANTIC_THRESHOLD", "0.25"))
    ENABLE_RERANKER = os.getenv("ENABLE_RERANKER", "true").lower() == "true"
    RERANKER_MODEL = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L6-v2")
    RERANK_TOP_N = int(os.getenv("RERANK_TOP_N", "5"))
    SCRIPTURE_BOOST = float(os.getenv("SCRIPTURE_BOOST", "0.12"))
    MAX_PASSAGE_CHARS = int(os.getenv("MAX_PASSAGE_CHARS", "1200"))

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
