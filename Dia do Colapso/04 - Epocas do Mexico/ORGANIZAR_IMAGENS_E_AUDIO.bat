@echo off
chcp 65001 >nul
cd /d "%~dp0"
python tools\organizar_imagens.py
echo.
echo Remontando o voiceover.wav a partir dos clipes (sem custo)...
python tools\narrar_chirp.py roteiro_epocas_mexico.txt narracao Algenib --idioma es-US
pause
