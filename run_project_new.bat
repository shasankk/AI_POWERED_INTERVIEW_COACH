@echo off
TITLE AI Mock Interviewer
ECHO =====================================================
ECHO      AI MOCK INTERVIEWER - STARTUP SCRIPT
ECHO =====================================================
ECHO.
ECHO 1. Activating Virtual Environment...
call ..\venv\Scripts\activate.bat

ECHO.
ECHO 2. Navigate to Web UI...
cd web_ui

ECHO.
ECHO 3. Starting Flask Server...
ECHO    (Open your browser to http://127.0.0.1:5000 once it starts)
ECHO.
python app.py
pause
