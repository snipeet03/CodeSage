@echo off
REM start.bat — Windows startup script for Smart Codebase Explainer

echo ================================================
echo   Smart Codebase Explainer — Startup Script
echo ================================================
echo.

REM Check for .env files
IF NOT EXIST "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo Created backend\.env — defaults are fine.
)
IF NOT EXIST "rag-service\.env" (
    copy "rag-service\.env.example" "rag-service\.env" >nul
    echo Created rag-service\.env — please add your GROQ_API_KEY!
)

echo Installing Node backend dependencies...
cd backend && npm install --silent && cd ..

echo Installing React frontend dependencies...
cd frontend && npm install --silent && cd ..

echo Setting up Python 3.10 virtual environment...
cd rag-service

REM Check Python version
FOR /F "tokens=2 delims= " %%i IN ('python --version 2^>^&1') DO SET PY_VER=%%i
echo Found Python %PY_VER%
echo %PY_VER% | findstr /B "3.10" >nul
IF ERRORLEVEL 1 (
    echo WARNING: Python 3.10 is required. Found %PY_VER%.
    echo Install Python 3.10 from https://www.python.org/downloads/
    echo If you have multiple Python versions, ensure python3.10 is on your PATH.
    pause
)

IF NOT EXIST ".venv" python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip -q
pip install -r requirements.txt -q
call deactivate
cd ..

echo.
echo Starting services in separate windows...
echo.

REM Python RAG service
start "RAG Service :8000" cmd /k "cd /d %CD%\rag-service && .venv\Scripts\activate && python main.py"

timeout /t 3 >nul

REM Node backend
start "Node Backend :3001" cmd /k "cd /d %CD%\backend && npm run dev"

timeout /t 2 >nul

REM React frontend
start "React Frontend :5173" cmd /k "cd /d %CD%\frontend && npm run dev"

echo.
echo All services started!
echo Open http://localhost:5173 in your browser.
echo.
echo Make sure GROQ_API_KEY is set in rag-service\.env
pause
