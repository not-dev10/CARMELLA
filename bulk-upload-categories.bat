@echo off
REM Batch wrapper for PowerShell bulk upload script
REM This allows easy right-click execution

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo.
    echo 📦 Carmella Bulk Category Upload
    echo.
    echo Usage:
    echo   bulk-upload-categories.bat -token "jwt_token_here"
    echo   bulk-upload-categories.bat -email "admin@example.com" -password "password"
    echo.
    echo Examples:
    echo   bulk-upload-categories.bat -token "eyJhbGciOiJIUzI1NiI..."
    echo   bulk-upload-categories.bat -email admin@example.com -password mypassword
    echo.
    pause
    exit /b 1
)

REM Run PowerShell script with arguments
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0bulk-upload-categories.ps1" %*

pause
