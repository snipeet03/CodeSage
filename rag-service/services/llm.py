"""
services/llm.py
Constructs a prompt from retrieved code chunks and calls the Groq LLM.
Uses strict prompt engineering to avoid hallucination.
"""

import os
import logging
from typing import Optional, Tuple, List
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from utils.config import Config

logger = logging.getLogger(__name__)

# System prompt enforces grounded, structured answers
SYSTEM_PROMPT = """You are a senior software engineer and code reviewer.
Your job is to answer questions about a codebase based ONLY on the code context provided.

Rules you MUST follow:
1. Only use the provided code context to answer. Do NOT invent or assume anything not in the context.
2. If the answer cannot be determined from the context, say "I could not find relevant code for this question."
3. Always explain step-by-step.
4. Reference specific file names and function/class names from the context.
5. Format your answer clearly using markdown with code blocks where appropriate.
6. Never hallucinate library names, function signatures, or behavior not shown in the code."""


def _build_context(chunks: List[Document]) -> Tuple[str, List[str]]:
    """
    Assemble a structured context string from retrieved chunks.
    Returns the context string and a list of source file paths.
    """
    parts = []
    sources = []

    for i, chunk in enumerate(chunks, 1):
        source = chunk.metadata.get("source", "unknown")
        if source not in sources:
            sources.append(source)

        parts.append(
            f"### Chunk {i} — File: `{source}`\n"
            f"```\n{chunk.page_content.strip()}\n```"
        )

    context = "\n\n".join(parts)
    return context, sources


class LLMService:
    """Handles context construction and Groq LLM invocation."""

    _client: Optional[ChatGroq] = None

    @classmethod
    def _get_client(cls) -> ChatGroq:
        if cls._client is None:
            cls._client = ChatGroq(
                api_key=Config.GROQ_API_KEY,
                model=Config.GROQ_MODEL,
                temperature=0.1,   # Low temp = more factual, less creative
            )
            logger.info(f"[LLM] Groq client initialized with model: {Config.GROQ_MODEL}")
        return cls._client

    @classmethod
    def answer(cls, question: str, chunks: List[Document]) -> Tuple[str, List[str]]:
        """
        Build a grounded prompt and query Groq.
        Returns the answer string and list of source files used.
        """
        context, sources = _build_context(chunks)

        user_message = (
            f"## Codebase Context\n\n{context}\n\n"
            f"---\n\n"
            f"## Question\n\n{question}"
        )

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_message),
        ]

        logger.info(f"[LLM] Sending prompt to Groq. Sources: {sources}")
        client = cls._get_client()
        response = client.invoke(messages)

        answer = response.content.strip()
        logger.info("[LLM] Response received.")
        return answer, sources
