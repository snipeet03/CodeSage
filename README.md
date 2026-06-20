# 🧠 CodeSage — AI Codebase Intelligence System

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

CodeSage is a production-grade **AI-powered codebase understanding system** that helps developers analyze, navigate, and understand large repositories using **Retrieval-Augmented Generation (RAG)**.

Instead of manually reading thousands of lines of code, developers can ask natural language questions and get **structured, context-aware explanations** powered by AI and semantic search.

## ✨ Key Features

- 🤖 **AI-Powered Code Analysis** — Ask questions about your codebase in natural language
- 📚 **RAG System** — Intelligent retrieval of relevant code context using semantic search
- 🔍 **Repository Indexing** — Fast FAISS-based vector indexing for efficient retrieval
- 💬 **Interactive Chat Interface** — User-friendly UI for querying your codebase
- 🔗 **Multi-Repository Support** — Analyze and switch between different repositories
- ⚡ **Real-time Processing** — Fast query responses with streaming capabilities
- 🎨 **Modern Frontend** — React + Vite for optimal performance

## 🏗️ Architecture

![CodeSage System Architecture](https://res.cloudinary.com/dhjzzee5y/image/upload/v1775452670/Screenshot_2026-04-06_103754_dyvbmm.png)


**System Overview:**

The CodeSage architecture consists of three main components:

1. **React Frontend (Port 5173)** — User-facing chat interface and repository manager
2. **Node.js Backend (Port 3000)** — API server handling queries and repository management
3. **Python RAG Service (Port 8000)** — Retrieval-Augmented Generation engine with FAISS vector store

**Data Flow:**
- Frontend sends user queries to Backend
- Backend forwards requests to RAG Service
- RAG Service retrieves relevant context from FAISS Vector Store
- LLM processes context and generates responses
- Results flow back through Backend to Frontend for display

## Render Deployment

The repository includes a Render blueprint in [render.yaml](render.yaml) for the RAG service.

1. Create a new Render service from this repository and let Render pick up the blueprint.
2. Set `GROQ_API_KEY` in Render as a secret environment variable.
3. Deploy the service from the `rag-service` directory with Python 3.10.
4. Update `backend/.env` so `RAG_SERVICE_URL` points at the deployed Render URL.

## Vercel Deployment

The frontend is deployed at https://code-sage-orcin.vercel.app/ and the backend is proxying to the Render RAG service.

1. Deploy the `rag-service` folder to Render first.
2. Copy the Render service URL, for example `https://codesage-yxza.onrender.com`.
3. Deploy the `backend` folder to Vercel as a separate project.
4. Set `RAG_SERVICE_URL` in the Vercel backend environment to the Render URL from step 2.
5. Deploy the `frontend` folder to Vercel.
6. Keep [frontend/vercel.json](frontend/vercel.json) pointing `/api/:path*` to the Render backend URL so the frontend can reach the backend in production.
7. Open the frontend at https://code-sage-orcin.vercel.app/ and verify `/api/warmup`, `/api/repo/load`, and `/api/query` are reaching the backend.

Flow:
Frontend on Vercel -> Backend on Vercel -> RAG service on Render


