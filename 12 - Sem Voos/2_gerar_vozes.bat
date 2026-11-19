@echo off
chcp 65001 >nul
title Canal Dark - Gerando e conferindo todas as vozes
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
if not exist "..\logs" mkdir "..\logs"
echo Instalando/conferindo pacotes (so demora na primeira vez)...
"%PY%" -m pip install -q faster-whisper num2words numpy > "..\logs\fabrica_pip.log" 2>&1
echo Gerando e conferindo todas as vozes... acompanhe em logs\vozes_semvoos.log
"%PY%" "..\fabrica\gerar_vozes.py" --pasta "%~dp0." --falas falas.json --elenco elenco.json  > "..\logs\vozes_semvoos.log" 2>&1
echo FIM > "..\logs\vozes_semvoos.log.fim"
powershell -NoProfile -Command "Get-Content '..\logs\vozes_semvoos.log' -Tail 25"
echo.
echo Pronto! Avise o Claude.
pause
