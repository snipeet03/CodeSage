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

![CodeSage System Architecture]("https://res.cloudinary.com/dhjzzee5y/image/upload/v1775452670/Screenshot_2026-04-06_103754_dyvbmm.png")


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


