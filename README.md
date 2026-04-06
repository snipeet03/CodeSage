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

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (5173)                    │
│              Chat, Repository Manager, UI                   │
└──────────────────────────┬──────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
┌────────▼────────┐ ┌────▼─────────┐ ┌───▼──────────────┐
│ Node.js Backend │ │ RAG Service  │ │  FAISS Vector   │
│ (Express 3000)  │ │ (Python 8000)│ │  Store (Local)  │
│                 │ │              │ │                 │
│ • Query Routes  │ │ • Retriever  │ │ • Embeddings    │
│ • Repo Routes   │ │ • Chunker    │ │ • Index Files   │
│ • Controllers   │ │ • LLM        │ └─────────────────┘
│ • Git Service   │ │ • Embedder   │
└─────────────────┘ └──────────────┘
```

## 📁 Project Structure

```
CodeSage/
├── backend/                    # Node.js server
│   ├── src/
│   │   ├── app.js             # Express app setup
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API endpoints
│   │   ├── rag/                # RAG pipeline
│   │   └── utils/              # Utilities
│   ├── repos/                  # Repository workspace
│   │   └── snipeet03_potfolio_web/  # Example repo
│   ├── server.js               # Entry point
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page layouts
│   │   ├── styles/             # Global styles
│   │   ├── utils/              # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── rag-service/                # Python RAG service
│   ├── main.py                 # FastAPI app
│   ├── routers/                # API routes
│   ├── services/               # RAG components
│   │   ├── chunker.py          # Text chunking
│   │   ├── embedder.py         # Embedding generation
│   │   ├── llm.py              # LLM integration
│   │   ├── retriever.py        # Context retrieval
│   │   └── vector_store.py     # FAISS management
│   ├── utils/                  # Configuration
│   ├── faiss_indexes/          # Vector indexes
│   ├── requirements.txt
│   └── pyproject.toml
│
└── README.md                   # This file
```
