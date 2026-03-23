"""
services/retriever.py
Retrieves top-K relevant code chunks from FAISS for a given query.
"""

import os
import logging
from typing import List
from langchain_core.documents import Document
from services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)

TOP_K = int(os.getenv("TOP_K", 5))


class RetrieverService:
    """Handles similarity search against the active FAISS vector store."""

    @staticmethod
    def retrieve(question: str) -> List[Document]:
        """
        Perform similarity search and return top-K relevant chunks.
        """
        store = VectorStoreService.get_active_store()
        logger.info(f"[Retriever] Searching for top-{TOP_K} chunks for: '{question}'")

        results = store.similarity_search(question, k=TOP_K)
        logger.info(f"[Retriever] Retrieved {len(results)} chunks.")
        return results
