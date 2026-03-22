# 🧠 Smart Codebase Explainer

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
