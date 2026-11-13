@echo off
chcp 65001 >nul
title Canal Dark - Testar MOSS-TTS-Nano
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
echo Testando o MOSS-TTS-Nano (deixe o VoiceStudio aberto)...
"%PY%" "..\fabrica\teste_voicestudio.py" --pasta "%~dp0." --pesos OpenMOSS-Team/MOSS-TTS-Nano-100M --motores moss-tts-nano > "..\logs\teste_moss2.log" 2>&1
echo FIM > "..\logs\teste_moss2.fim"
echo Pronto!
