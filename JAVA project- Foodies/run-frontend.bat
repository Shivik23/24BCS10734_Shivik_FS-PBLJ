@echo off
title Foodies Frontend Server (Port 5173)
cd /d "%~dp0frontend"

echo ===================================================
echo Starting Foodies Frontend (Vite on Port 5173)
echo ===================================================

npm run dev

