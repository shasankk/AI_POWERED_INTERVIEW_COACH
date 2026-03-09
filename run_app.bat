@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo      VoiceSync - Speech & Text Interface
echo ===================================================

REM Define paths
set "PROJECT_ROOT=%~dp0"
set "VENV_PYTHON=%PROJECT_ROOT%venv\Scripts\python.exe"
set "APP_DIR=%PROJECT_ROOT%web_ui"

REM Check if Python venv exists
if not exist "%VENV_PYTHON%" (
    echo Error: Virtual environment not found at "%VENV_PYTHON%"
    echo Please make sure you have set up the environment correctly.
    pause
    exit /b 1
)

echo.
echo [1/2] Checking dependencies...
"%VENV_PYTHON%" -m pip install -r "%PROJECT_ROOT%requirements.txt" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    - Installing dependencies from requirements.txt...
    "%VENV_PYTHON%" -m pip install -r "%PROJECT_ROOT%requirements.txt"
) else (
    echo    - Dependencies ready.
)

echo.
echo [2/2] Starting Application...
echo.
echo    OPENING BROWSER...
echo    (Press Ctrl+C to stop the server)
echo.

cd /d "%APP_DIR%"
"%VENV_PYTHON%" app.py

pause
