# 🧠 CodeSage — AI Codebase Intelligence System

CodeSage is a production-grade **AI-powered codebase understanding system** that helps developers analyze, navigate, and understand large repositories using **Retrieval-Augmented Generation (RAG)**.

Instead of manually reading thousands of lines of code, developers can ask natural language questions and get **structured, context-aware explanations**.
---

`



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

