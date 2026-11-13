@echo off
chcp 65001 >nul
title Canal Dark - Teste VoiceStudio
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
"%PY%" -m pip install -q requests > "..\logs\vs_pip.log" 2>&1
echo Testando o VoiceStudio (deixe o app aberto)... acompanhe em logs\teste_voicestudio.log
"%PY%" "..\fabrica\teste_voicestudio.py" --pasta "%~dp0." > "..\logs\teste_voicestudio.log" 2>&1
echo FIM > "..\logs\teste_voicestudio.fim"
echo Pronto!
