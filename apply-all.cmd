@echo off
cd /d "%~dp0"
call npm.cmd run apply:all
if errorlevel 1 exit /b 1
echo.
echo Done. Refresh http://localhost:4173 with Ctrl+Shift+R
