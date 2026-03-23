"""
routers/index_router.py
POST /index — receives a repo path, loads files, chunks, embeds, stores in FAISS.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging

from services.file_loader import FileLoaderService
from services.chunker import ChunkerService
from services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)
router = APIRouter()


class IndexRequest(BaseModel):
    repo_path: str
    repo_name: str


class IndexResponse(BaseModel):
    status: str
    repo_name: str
    files_loaded: int
    chunks_created: int


@router.post("/index", response_model=IndexResponse)
async def index_repository(payload: IndexRequest):
    """
    Full indexing pipeline:
    1. Recursively load code files
    2. Chunk code intelligently
    3. Embed chunks with HuggingFace
    4. Store in FAISS
    """
    logger.info(f"[index] Starting indexing for repo: {payload.repo_name} at {payload.repo_path}")

    # Step 1 — Load files
    try:
        documents = FileLoaderService.load_repo(payload.repo_path)
    except Exception as e:
        logger.error(f"[index] File loading failed: {e}")
        raise HTTPException(status_code=500, detail=f"File loading error: {str(e)}")

    if not documents:
        raise HTTPException(status_code=400, detail="No supported source files found in repository.")

    logger.info(f"[index] Loaded {len(documents)} files.")

    # Step 2 — Chunk
    try:
        chunks = ChunkerService.chunk_documents(documents)
    except Exception as e:
        logger.error(f"[index] Chunking failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chunking error: {str(e)}")

    logger.info(f"[index] Created {len(chunks)} chunks.")

    # Step 3 & 4 — Embed + Store
    try:
        VectorStoreService.build_and_save(chunks, payload.repo_name)
    except Exception as e:
        logger.error(f"[index] Vector store build failed: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding/FAISS error: {str(e)}")

    logger.info(f"[index] Indexing complete for {payload.repo_name}.")

    return IndexResponse(
        status="indexed",
        repo_name=payload.repo_name,
        files_loaded=len(documents),
        chunks_created=len(chunks),
    )
