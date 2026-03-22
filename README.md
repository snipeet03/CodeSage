# 🧠 Smart Codebase Explainer
# 🧠 CodeSage — AI Codebase Intelligence System

CodeSage is a production-grade **AI-powered codebase understanding system** that helps developers analyze, navigate, and understand large repositories using **Retrieval-Augmented Generation (RAG)**.

Instead of manually reading thousands of lines of code, developers can ask natural language questions and get **structured, context-aware explanations**.

---

# ✨ Features

- 🔍 **Repository Ingestion**
  - Clone and process any public GitHub repository

- 🧠 **AI-Powered Code Understanding**
  - Ask questions like:
    - “How does authentication work?”
    - “Where is API routing handled?”

- 📚 **RAG-Based Retrieval**
  - Context-aware answers using embeddings + vector search

- ⚡ **Fast LLM Inference**
  - Powered by Groq (LLaMA3 / Mixtral)

- 🧩 **Microservice Architecture**
  - Node.js + Python (LangChain) based scalable system

- 💬 **Interactive Chat UI**
  - Simple interface for querying repositories

---
A production-grade **Code Intelligence System** built with a microservice architecture:
- **React (Vite)** frontend
- **Node.js (Express)** API gateway
- **Python (FastAPI + LangChain)** RAG service with FAISS + Groq LLM

---
## 🚀 Quick Start

### 1. Clone this project & install dependencies

```bash
# Backend
cd backend
npm install

# RAG Service — MUST use Python 3.10
cd ../rag-service
python3.10 -m venv .venv          # Mac/Linux
# python3 -m venv .venv           # if python3 already points to 3.10
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```
