@echo off
title StatusHired (MERN)
cd /d "%~dp0"
if not exist server\.env (
  echo Creating server\.env from server\.env.example ...
  copy server\.env.example server\.env >nul
)
if not exist node_modules call npm run install:all
echo.
echo Starting API (http://localhost:5000) and React app (http://localhost:3000) ...
call npm run dev
pause
