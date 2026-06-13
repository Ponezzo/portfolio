@echo off
cd /d "%~dp0"
call npm.cmd run apply:all
echo Starting local server at http://localhost:4173
start "" http://localhost:4173
call npx.cmd serve . -p 4173
