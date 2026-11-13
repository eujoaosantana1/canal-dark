@echo off
chcp 65001 >nul
title Canal Dark - Testar outros modelos de voz do Gemini
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
if not exist "..\logs" mkdir "..\logs"
echo Testando as vozes nos outros modelos do Gemini (uns 2 minutos)...
"%PY%" "..\fabrica\teste_modelos.py" --pasta "%~dp0." > "..\logs\teste_modelos.log" 2>&1
type "..\logs\teste_modelos.log"
echo.
echo Pronto! Ouça comparacao_modelos_gemini.mp3 nesta pasta.
pause
