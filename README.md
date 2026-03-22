# 🧠 Smart Codebase Explainer

A production-grade **Code Intelligence System** built with a microservice architecture:
- **React (Vite)** frontend
- **Node.js (Express)** API gateway
- **Python (FastAPI + LangChain)** RAG service with FAISS + Groq LLM

---

## 🏗️ Architecture

```
Frontend (React :5173)
        ↓
Node.js Backend (Express :3001)
        ↓
Python RAG Service (FastAPI :8000)
        ↓
FAISS + HuggingFace Embeddings + Groq LLaMA 3
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| **Python** | **3.10.x (required)** |
| Git | any |

> ⚠️ **Python 3.10 is required** for the RAG service. The pinned dependencies (`faiss-cpu`, `torch`, `sentence-transformers`) are tested and verified specifically on Python 3.10. Using 3.11+ or 3.9 may cause package conflicts.
>
> Check your version: `python3 --version`
> Install Python 3.10: https://www.python.org/downloads/release/python-31012/

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
