@echo off
chcp 65001 >nul
title Canal Dark - Testar vozes prontas nos outros modelos do Gemini
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
if not exist "..\logs" mkdir "..\logs"
echo Testando Bodi, Mako, Ludo e as outras vozes prontas nos modelos extras do Gemini.
echo Leva uns 5 minutos. Nao feche esta janela.
"%PY%" "..\fabrica\teste_vozes_prontas.py" --pasta "%~dp0." > "..\logs\teste_vozes_prontas.log" 2>&1
type "..\logs\teste_vozes_prontas.log"
echo.
echo Pronto! Ouca os arquivos vozes_prontas__*.mp3 nesta pasta.
pause
