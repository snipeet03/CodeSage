"""
main.py — FastAPI application entry point for the RAG service.
Exposes /index and /query endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging
import os
import threading

from routers import index_router, query_router
from services.vector_store import VectorStoreService

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── App lifespan (startup / shutdown) ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 RAG Service starting up...")

    # ✅ NON-BLOCKING: Load embeddings in background
    def load_embeddings():
        try:
            logger.info("🔄 Loading embeddings in background...")
            VectorStoreService.preload_embeddings()
            logger.info("✅ Embeddings loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error loading embeddings: {e}")

    threading.Thread(target=load_embeddings, daemon=True).start()

    yield

    logger.info("🛑 RAG Service shutting down.")


# ── FastAPI instance ────────────────────────────────────────────────────────
app = FastAPI(
    title="Codebase Explainer — RAG Service",
    description="Indexes GitHub repos and answers natural language questions about code.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 🔥 change this in production if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────
app.include_router(index_router, prefix="", tags=["Indexing"])
app.include_router(query_router, prefix="", tags=["Query"])


# ── Health check ────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "service": "rag-service"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "rag-service"}


# ── Entry point (ONLY for local dev) ────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    is_dev = os.environ.get("ENV", "dev") == "dev"

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=is_dev   # ✅ reload only locally
    )