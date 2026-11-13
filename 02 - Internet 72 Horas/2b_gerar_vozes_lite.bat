@echo off
chcp 65001 >nul
title Canal Dark - Gerando vozes (Gemini 3.8 Flash Lite TTS)
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
if not exist "..\logs" mkdir "..\logs"
if exist estado_vozes.json move /y estado_vozes.json estado_vozes_modelo_antigo.json >nul
echo Gerando e conferindo todas as vozes com o modelo Lite...
echo Leva uns 20 a 30 minutos. Pode deixar rodando.
"%PY%" "..\fabrica\gerar_vozes.py" --pasta "%~dp0." --falas falas.json --elenco elenco.json --modelo gemini-3.8-flash-lite-tts > "..\logs\vozes_72h.log" 2>&1
echo FIM > "..\logs\vozes_72h.log.fim"
powershell -NoProfile -Command "Get-Content '..\logs\vozes_72h.log' -Tail 25"
echo.
echo Pronto! Avise o Claude.
pause
