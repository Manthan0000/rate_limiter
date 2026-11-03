@echo off
cd /d "%~dp0"
start cmd /k uvicorn backend.main:app --port 8001 --reload
start cmd /k uvicorn gateway.gateway:app --port 8000 --reload
start cmd /k "cd dashboard && npm run dev"
