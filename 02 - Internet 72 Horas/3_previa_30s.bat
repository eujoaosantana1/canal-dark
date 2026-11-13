@echo off
title Canal Dark - Previa 30s (72 horas)
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
set VS_CHANNEL=msedge
set VID=%~dp0.
set PROJ=internet-72h
if not exist "..\logs" mkdir "..\logs"
if not exist "voiceover.wav" (echo Falta gerar as vozes. & pause & exit /b)
powershell -NoProfile -Command "Expand-Archive -Force 'cenas_72h.zip' '..\viralstick'" > "..\logs\72h_extrair.log" 2>&1
echo [1/4] Montando cenas, palavras, musica e efeitos...
"%PY%" "..\fabrica\montar_video.py" --pasta "%VID%" --projeto %PROJ% > "..\logs\72h_montar.log" 2>&1
type "..\logs\72h_montar.log"
cd /d "%~dp0..\viralstick"
echo [2/4] Mixando voz + musica + efeitos...
"%PY%" audio\mix.py --project projects/%PROJ% > "..\logs\72h_mix.log" 2>&1
echo [3/4] Renderizando os primeiros 30 segundos (uns minutos)...
node render.mjs --project projects/%PROJ% --gl gpu --from 0 --to 30 --out projects/%PROJ%/build/previa.mp4 > "..\logs\72h_previa.log" 2>&1
echo [4/4] Juntando imagem e som...
ffmpeg -nostdin -v error -y -i projects/%PROJ%/build/previa.mp4 -t 30 -i projects/%PROJ%/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "%VID%\PREVIA_30s.mp4" >> "..\logs\72h_previa.log" 2>&1
echo OK > "..\logs\72h_previa.fim"
if exist "%VID%\PREVIA_30s.mp4" (echo Pronto! PREVIA_30s.mp4 na pasta do video.) else (echo Algo falhou. Avise o Claude.)
pause
