@echo off
chcp 65001 >nul
title Canal Dark - Video 11: espera as 5h, gera as vozes e o video
cd /d "%~dp0"
echo Deixe esta janela aberta e o PC ligado.
echo As 7h05 ele gera as vozes e depois o video final, sozinho.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0rodar_as_5h.ps1"
pause
