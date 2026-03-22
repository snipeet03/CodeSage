#!/usr/bin/env bash
# start.sh — Starts all three services in separate terminal tabs/panes.
# Usage: chmod +x start.sh && ./start.sh

set -e

echo "================================================"
echo "  🧠 Smart Codebase Explainer — Startup Script"
echo "================================================"

# ── Check prerequisites ────────────────────────────────────────────
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 not found."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git not found."; exit 1; }

# ── Check .env files ───────────────────────────────────────────────
if [ ! -f "rag-service/.env" ]; then
  echo "⚠️  rag-service/.env not found. Copying from .env.example..."
  cp rag-service/.env.example rag-service/.env
  echo "📝 Please edit rag-service/.env and add your GROQ_API_KEY"
fi

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
fi

# ── Install dependencies ───────────────────────────────────────────
echo ""
echo "📦 Installing Node backend dependencies..."
cd backend && npm install --silent && cd ..

echo "📦 Installing React frontend dependencies..."
cd frontend && npm install --silent && cd ..

echo "📦 Setting up Python virtual environment (Python 3.10 required)..."
cd rag-service

# Prefer python3.10 explicitly; fall back to python3 with version check
if command -v python3.10 >/dev/null 2>&1; then
  PYTHON_BIN="python3.10"
else
  PY_VER=$(python3 -c "import sys; print(sys.version_info.minor)")
  if [ "$PY_VER" != "10" ]; then
    echo "❌ Python 3.10 is required but found Python 3.${PY_VER}."
    echo "   Install Python 3.10 from https://www.python.org/downloads/"
    exit 1
  fi
  PYTHON_BIN="python3"
fi

echo "   Using $($PYTHON_BIN --version)"
if [ ! -d ".venv" ]; then
  $PYTHON_BIN -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
deactivate
cd ..

echo ""
echo "✅ All dependencies installed."
echo ""
echo "🚀 Starting services..."
echo ""
echo "  Service 1 → Python RAG   : http://localhost:8000"
echo "  Service 2 → Node Backend  : http://localhost:3001"
echo "  Service 3 → React Frontend: http://localhost:5173"
echo ""

# ── Start services ─────────────────────────────────────────────────
# Python RAG service
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/rag-service\" && source .venv/bin/activate && python main.py"' 2>/dev/null || \
  (cd rag-service && source .venv/bin/activate && python main.py &)

sleep 2

# Node backend
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/backend\" && npm run dev"' 2>/dev/null || \
  (cd backend && npm run dev &)

sleep 1

# React frontend
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'/frontend\" && npm run dev"' 2>/dev/null || \
  (cd frontend && npm run dev &)

echo "✅ All services started. Open http://localhost:5173 in your browser."
echo ""
echo "⚠️  Make sure your GROQ_API_KEY is set in rag-service/.env"
