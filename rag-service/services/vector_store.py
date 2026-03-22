"""
services/vector_store.py
Manages FAISS vector store creation and persistence.
Uses HuggingFace sentence-transformers for embeddings.
"""

import os
import logging
from typing import Optional
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
FAISS_INDEX_DIR = os.getenv("FAISS_INDEX_DIR", "./faiss_indexes")

# Singleton embedding model — loaded once, reused
_embeddings: Optional[HuggingFaceEmbeddings] = None

# In-memory store for the latest indexed repo
_vector_store: Optional[FAISS] = None
_current_repo: Optional[str] = None


def _get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        logger.info(f"[VectorStore] Loading embedding model: {EMBEDDING_MODEL}")
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        logger.info("[VectorStore] Embedding model loaded.")
    return _embeddings


class VectorStoreService:
    """Handles FAISS index creation, persistence, and loading."""

    @staticmethod
    def preload_embeddings():
        """Called at startup to warm up the embedding model."""
        _get_embeddings()

    @staticmethod
    def build_and_save(chunks: list[Document], repo_name: str) -> None:
        """
        Embed all chunks and save the FAISS index to disk.
        Also keeps a reference in memory for fast querying.
        """
        global _vector_store, _current_repo

        embeddings = _get_embeddings()

        logger.info(f"[VectorStore] Building FAISS index for '{repo_name}' with {len(chunks)} chunks...")
        store = FAISS.from_documents(chunks, embeddings)

        # Persist to disk
        index_path = os.path.join(FAISS_INDEX_DIR, repo_name)
        os.makedirs(index_path, exist_ok=True)
        store.save_local(index_path)
        logger.info(f"[VectorStore] FAISS index saved to {index_path}")

        # Keep in memory
        _vector_store = store
        _current_repo = repo_name

    @staticmethod
    def load(repo_name: str) -> FAISS:
        """Load a previously saved FAISS index from disk."""
        global _vector_store, _current_repo

        if _vector_store is not None and _current_repo == repo_name:
            return _vector_store

        index_path = os.path.join(FAISS_INDEX_DIR, repo_name)
        if not os.path.isdir(index_path):
            raise FileNotFoundError(
                f"No FAISS index found for repo '{repo_name}'. "
                "Please index a repository first."
            )

        embeddings = _get_embeddings()
        logger.info(f"[VectorStore] Loading FAISS index from {index_path}")
        store = FAISS.load_local(
            index_path, embeddings, allow_dangerous_deserialization=True
        )
        _vector_store = store
        _current_repo = repo_name
        return store

    @staticmethod
    def get_active_store() -> FAISS:
        """Return the currently active in-memory vector store, or try to auto-load if missing."""
        global _vector_store, _current_repo
        
        if _vector_store is None:
            # Attempt to auto-load if only one index exists in the directory
            if os.path.isdir(FAISS_INDEX_DIR):
                indexes = os.listdir(FAISS_INDEX_DIR)
                if len(indexes) == 1:
                    logger.info(f"[VectorStore] Auto-loading detected index: {indexes[0]}")
                    return VectorStoreService.load(indexes[0])
                    
            raise RuntimeError(
                "No repository is indexed yet. "
                "Please submit a GitHub URL to index first."
            )
        return _vector_store
