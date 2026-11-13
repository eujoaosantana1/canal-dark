@echo off
chcp 65001 >nul
title Canal Dark - Video do Valdir (v4 - falas conferidas)
cd /d "%~dp0"
call "%~dp0_ambiente.bat"
set VS_CHANNEL=msedge
if not exist logs mkdir logs
del /q logs\v4_fim.txt 2>nul
echo [1/4] Atualizando narracao e tempos...
powershell -NoProfile -Command "Expand-Archive -Force 'valdir_v4.zip' 'viralstick'" > logs\v4_extrair.log 2>&1
cd viralstick
del /q "projects\imposto-vida-inteira\out\*.mp4" 2>nul
echo [2/4] Renderizando (uns 6 minutos)...
node render.mjs --project projects/imposto-vida-inteira --gl gpu > ..\logs\v4_render.log 2>&1
echo [3/4] Musica, efeitos e narracao...
"%PY%" audio\mix.py --project projects/imposto-vida-inteira > ..\logs\v4_mix.log 2>&1
echo [4/4] Copiando o video final...
for %%f in ("projects\imposto-vida-inteira\out\*.mp4") do copy /Y /B "%%f" "..\VIDEO_FINAL_valdir_v4.mp4" >> ..\logs\v4_mix.log 2>&1
echo OK > ..\logs\v4_fim.txt
echo Pronto! Canal Dark\VIDEO_FINAL_valdir_v4.mp4
