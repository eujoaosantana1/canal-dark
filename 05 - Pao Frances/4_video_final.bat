@echo off
title Canal Dark - Video final (pao frances)
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0..\_ambiente.bat"
set PYTHONIOENCODING=utf-8
set VS_CHANNEL=msedge
set VID=%~dp0.
set PROJ=pao-frances
if not exist "..\logs" mkdir "..\logs"
if not exist "voiceover.wav" (echo Falta gerar as vozes: rode 2_gerar_vozes.bat primeiro. & pause & exit /b)
powershell -NoProfile -Command "Expand-Archive -Force 'cenas_pao.zip' '..\viralstick'" > "..\logs\pao_extrair.log" 2>&1
echo [1] Montando cenas, palavras e musica...
"%PY%" "..\fabrica\montar_video.py" --pasta "%VID%" --projeto %PROJ% > "..\logs\pao_montar.log" 2>&1
cd /d "%~dp0..\viralstick"
echo [2] Renderizando o video inteiro (uns 15-25 minutos, pode deixar rodando)...
del /q "projects\%PROJ%\out\*.mp4" 2>nul
node render.mjs --project projects/%PROJ% --gl gpu > "..\logs\pao_render.log" 2>&1
echo [3] Musica, efeitos e narracao...
"%PY%" audio\mix.py --project projects/%PROJ% > "..\logs\pao_mix.log" 2>&1
for %%f in ("projects\%PROJ%\out\*.mp4") do copy /Y /B "%%f" "%VID%\VIDEO_FINAL_pao.mp4" >> "..\logs\pao_mix.log" 2>&1
echo OK > "..\logs\pao_final.fim"
if exist "%VID%\VIDEO_FINAL_pao.mp4" (echo Pronto! VIDEO_FINAL_pao.mp4 na pasta do video.) else (echo Algo falhou. Avise o Claude.)
pause
