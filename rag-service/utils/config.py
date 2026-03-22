"""
utils/config.py
Centralised configuration loaded from environment variables.
Import this module anywhere instead of calling os.getenv repeatedly.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Groq
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama3-70b-8192")

    # Embeddings
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    # Retrieval
    TOP_K: int = int(os.getenv("TOP_K", "5"))

    # Chunking
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "150"))

    # Storage
    FAISS_INDEX_DIR: str = os.getenv("FAISS_INDEX_DIR", "./faiss_indexes")
