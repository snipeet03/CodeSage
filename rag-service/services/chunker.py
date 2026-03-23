"""
services/chunker.py
Code-aware chunking using LangChain's RecursiveCharacterTextSplitter
with language-specific separators. This avoids random mid-function splits.
"""

import os
import logging
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language

logger = logging.getLogger(__name__)

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 150))

# Map file extensions to LangChain Language enum
EXTENSION_LANGUAGE_MAP = {
    ".py": Language.PYTHON,
    ".js": Language.JS,
    ".jsx": Language.JS,
    ".ts": Language.JS,
    ".tsx": Language.JS,
    ".java": Language.JAVA,
    ".go": Language.GO,
    ".rb": Language.RUBY,
    ".cpp": Language.CPP,
    ".c": Language.C,
    ".cs": Language.CSHARP,
    ".rs": Language.RUST,
    ".html": Language.HTML,
    ".md": Language.MARKDOWN,
    ".sol": Language.SOL,
}


def _get_splitter_for_extension(ext: str) -> RecursiveCharacterTextSplitter:
    """Return the best text splitter for a given file extension."""
    language = EXTENSION_LANGUAGE_MAP.get(ext)
    if language:
        try:
            return RecursiveCharacterTextSplitter.from_language(
                language=language,
                chunk_size=CHUNK_SIZE,
                chunk_overlap=CHUNK_OVERLAP,
            )
        except Exception:
            pass  # Fall through to generic splitter

    # Generic splitter for config, YAML, SQL, etc.
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""],
    )


class ChunkerService:
    """Splits LangChain Documents into smaller, code-aware chunks."""

    @staticmethod
    def chunk_documents(documents: List[Document]) -> List[Document]:
        """
        For each document, apply the appropriate language-aware splitter.
        Preserves and enriches metadata (source file, chunk index).
        """
        all_chunks: List[Document] = []

        for doc in documents:
            ext = doc.metadata.get("extension", "")
            splitter = _get_splitter_for_extension(ext)

            try:
                chunks = splitter.split_documents([doc])
            except Exception as e:
                logger.warning(f"[Chunker] Failed to split {doc.metadata.get('source')}: {e}")
                # Fall back to the raw document as a single chunk
                chunks = [doc]

            # Enrich each chunk with its index for traceability
            for i, chunk in enumerate(chunks):
                chunk.metadata["chunk_index"] = i
                chunk.metadata["total_chunks"] = len(chunks)

            all_chunks.extend(chunks)

        logger.info(f"[Chunker] Total chunks created: {len(all_chunks)}")
        return all_chunks
