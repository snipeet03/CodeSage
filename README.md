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

### 2. Configure environment variables

**backend/.env**
```env
PORT=3001
RAG_SERVICE_URL=http://localhost:8000
REPOS_DIR=./repos
```

**rag-service/.env**
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
EMBEDDING_MODEL=all-MiniLM-L6-v2
TOP_K=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=150
FAISS_INDEX_DIR=./faiss_indexes
```

> Get a free Groq API key at: https://console.groq.com

### 3. Run all services

Open **3 terminal windows**:

```bash
# Terminal 1 — Python RAG Service
cd rag-service
source .venv/bin/activate
python main.py

# Terminal 2 — Node Backend
cd backend
npm run dev

# Terminal 3 — React Frontend
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 📡 API Reference

### Node Backend (port 3001)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/repo/load` | `{ repoUrl }` | Clone + index a GitHub repo |
| POST | `/api/query` | `{ question }` | Ask a question about the code |
| GET | `/health` | — | Health check |

### Python RAG Service (port 8000)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/index` | `{ repo_path, repo_name }` | Index a local repo into FAISS |
| POST | `/query` | `{ question }` | RAG query → Groq LLM answer |
| GET | `/health` | — | Health check |

---

## 📁 Project Structure

```
codebase-explainer/
├── backend/
│   ├── server.js               # Express entry point
│   ├── routes/
│   │   ├── repo.routes.js      # POST /api/repo/load
│   │   └── query.routes.js     # POST /api/query
│   ├── services/
│   │   ├── repo.service.js     # Git clone + RAG trigger
│   │   └── query.service.js    # Query forwarding
│   └── utils/
│       └── errorHandler.js     # Global error middleware
│
├── rag-service/
│   ├── main.py                 # FastAPI entry point
│   ├── routers/
│   │   ├── index_router.py     # POST /index
│   │   └── query_router.py     # POST /query
│   └── services/
│       ├── file_loader.py      # Recursive code file loader
│       ├── chunker.py          # Code-aware chunking
│       ├── vector_store.py     # FAISS + HuggingFace embeddings
│       ├── retriever.py        # Top-K similarity retrieval
│       └── llm.py              # Groq LLM + prompt engineering
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Screen router
    │   ├── pages/
    │   │   ├── RepoLoader.jsx  # GitHub URL input screen
    │   │   └── ChatInterface.jsx # Chat screen
    │   ├── components/
    │   │   └── ChatMessage.jsx # Message bubble w/ markdown
    │   └── utils/
    │       └── api.js          # Fetch wrapper
    └── vite.config.js
```

---

## 🧠 How It Works

### Indexing Pipeline
1. User submits GitHub URL → Node clones repo with `simple-git`
2. Node sends local path to Python `/index`
3. Python recursively loads all source files (skipping `node_modules`, `.git`, etc.)
4. Files are chunked with **language-aware splitters** (no random token cuts)
5. Chunks are embedded using **HuggingFace all-MiniLM-L6-v2**
6. Embeddings stored in **FAISS** vector index (saved to disk)

### Query Pipeline
1. User asks a question → Node forwards to Python `/query`
2. Python performs **top-5 similarity search** on FAISS
3. Retrieved chunks are assembled into structured context
4. Context + question sent to **Groq LLaMA 3 (70B)** with strict anti-hallucination prompt
5. Grounded answer returned with source file references

---

## 🔑 Getting a Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Create an API key
4. Paste it into `rag-service/.env` as `GROQ_API_KEY`

Groq offers a **free tier** with generous rate limits.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on query | Python RAG service not running |
| `GROQ_API_KEY not set` | Add key to `rag-service/.env` |
| `No files found` | Repo may use unsupported extensions |
| FAISS import error | Run `pip install faiss-cpu==1.7.4` |
| Port conflict | Change `PORT` in backend `.env` |
| `pip install` fails / dependency conflict | Ensure you're using **Python 3.10** exactly: `python3.10 -m venv .venv` |
| `torch` install is slow | This is normal — PyTorch is ~700 MB. Run once and it's cached. |
| `ModuleNotFoundError: langchain_groq` | Activate venv first: `source .venv/bin/activate` |
