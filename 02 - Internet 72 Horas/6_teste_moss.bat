@echo off
chcp 65001 >nul
title Canal Dark - Instalar e testar MOSS-TTS-Nano
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
echo Instalando o MOSS-TTS-Nano no VoiceStudio e testando (deixe o app aberto)...
"%PY%" "..\fabrica\teste_voicestudio.py" --pasta "%~dp0." --instalar moss-tts-nano --motores moss-tts-nano > "..\logs\teste_moss.log" 2>&1
echo FIM > "..\logs\teste_moss.fim"
echo Pronto!
