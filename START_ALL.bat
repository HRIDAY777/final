@echo off
REM ============================================================================
REM EduCore Ultra - Complete Startup Script (Windows)
REM ============================================================================

echo ========================================
echo Starting EduCore Ultra
echo ========================================
echo.

REM Colors
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo %BLUE%Checking prerequisites...%NC%
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Python is not installed or not in PATH%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ Python found%NC%

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Node.js is not installed or not in PATH%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ Node.js found%NC%

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: npm is not installed or not in PATH%NC%
    pause
    exit /b 1
)
echo %GREEN%✓ npm found%NC%

echo.
echo %YELLOW%========================================%NC%
echo %YELLOW%Starting Backend (Django)...%NC%
echo %YELLOW%========================================%NC%
echo.

REM Start Backend in new window
start "EduCore Backend" cmd /k "cd backend && python -m venv venv 2>nul && call venv\Scripts\activate.bat && pip install -r requirements.txt >nul 2>&1 && python manage.py migrate && python manage.py runserver"

echo %GREEN%✓ Backend starting on http://localhost:8000%NC%
echo.

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

echo %YELLOW%========================================%NC%
echo %YELLOW%Starting Frontend (React + Vite)...%NC%
echo %YELLOW%========================================%NC%
echo.

REM Start Frontend in new window
start "EduCore Frontend" cmd /k "cd frontend && npm install >nul 2>&1 && npm run dev"

echo %GREEN%✓ Frontend starting on http://localhost:3000%NC%
echo.

echo %GREEN%========================================%NC%
echo %GREEN%EduCore Ultra is starting!%NC%
echo %GREEN%========================================%NC%
echo.
echo %BLUE%Services:%NC%
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:3000
echo   - API Docs: http://localhost:8000/api/docs/
echo.
echo %YELLOW%Press Ctrl+C in each window to stop services%NC%
echo %YELLOW%This window can be closed%NC%
echo.

pause

