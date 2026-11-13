@echo off
chcp 65001 >nul
title Canal Dark - Configurar MOSS e testar
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
echo Configurando pasta curta para os modulos do MOSS...
if not exist "%USERPROFILE%\hfm" mkdir "%USERPROFILE%\hfm"
setx HF_MODULES_CACHE "%USERPROFILE%\hfm" > "..\logs\config_moss.log" 2>&1
set "HF_MODULES_CACHE=%USERPROFILE%\hfm"
echo Reiniciando o VoiceStudio...
taskkill /IM VoiceStudio.exe /T /F >> "..\logs\config_moss.log" 2>&1
timeout /t 8 /nobreak > nul
start "" "C:\Program Files\VoiceStudio\VoiceStudio.exe"
echo Testando o MOSS-TTS-Nano...
"%PY%" "..\fabrica\teste_voicestudio.py" --pasta "%~dp0." --esperar 300 --motores moss-tts-nano > "..\logs\teste_moss3.log" 2>&1
echo FIM > "..\logs\teste_moss3.fim"
echo Pronto!
