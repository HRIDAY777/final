@echo off
echo ========================================
echo    Starting EduCore Ultra Website
echo ========================================
echo.

echo [1/2] Starting Backend Server (Django)...
start "EduCore Backend" cmd /k "cd /d %~dp0backend && python manage.py runserver"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server (Vite)...
start "EduCore Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo Admin:    http://127.0.0.1:8000/admin
echo.
echo Opening website in browser...
timeout /t 3 /nobreak > nul
start http://localhost:5173
echo.
echo ========================================
echo    Website is now running!
echo ========================================
echo.
echo Press any key to exit this window...
echo (Keep the server windows open)
pause > nul

