"""
routers/query_router.py
POST /query — retrieves relevant chunks and generates an LLM-grounded answer.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging

from services.retriever import RetrieverService
from services.llm import LLMService

logger = logging.getLogger(__name__)
router = APIRouter()


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[str]


@router.post("/query", response_model=QueryResponse)
async def query_codebase(payload: QueryRequest):
    """
    Query pipeline:
    1. Retrieve top-K relevant code chunks from FAISS
    2. Build structured context
    3. Send to Groq LLM with strict prompt
    4. Return grounded answer
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="question cannot be empty.")

    logger.info(f"[query] Question received: {question}")

    # Step 1 — Retrieve
    try:
        chunks = RetrieverService.retrieve(question)
    except Exception as e:
        logger.error(f"[query] Retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"Retrieval error: {str(e)}")

    if not chunks:
        return QueryResponse(
            question=question,
            answer="No relevant code was found in the indexed repository. Please make sure a repo is indexed first.",
            sources=[],
        )

    # Step 2 — Generate answer
    try:
        answer, sources = LLMService.answer(question, chunks)
    except Exception as e:
        logger.error(f"[query] LLM generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    logger.info(f"[query] Answer generated. Sources: {sources}")

    return QueryResponse(question=question, answer=answer, sources=sources)
