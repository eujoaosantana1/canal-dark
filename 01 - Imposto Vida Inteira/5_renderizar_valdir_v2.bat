@echo off
chcp 65001 >nul
title Canal Dark - Video do Valdir (voz nova do Seu Nene)
cd /d "%~dp0"
call "%~dp0_ambiente.bat"
set VS_CHANNEL=msedge
if not exist logs mkdir logs
del /q logs\v2_fim.txt 2>nul
echo [1/4] Atualizando narracao e tempos...
powershell -NoProfile -Command "Expand-Archive -Force 'valdir_nene_v2.zip' 'viralstick'" > logs\v2_extrair.log 2>&1
cd viralstick
echo [2/4] Renderizando (uns 6 minutos)...
node render.mjs --project projects/imposto-vida-inteira --gl gpu > ..\logs\v2_render.log 2>&1
echo [3/4] Musica, efeitos e narracao...
"%PY%" audio\mix.py --project projects/imposto-vida-inteira > ..\logs\v2_mix.log 2>&1
echo [4/4] Copiando o video final...
for %%f in ("projects\imposto-vida-inteira\out\*.mp4") do copy /Y /B "%%f" "..\VIDEO_FINAL_valdir_v2.mp4" >> ..\logs\v2_mix.log 2>&1
echo OK > ..\logs\v2_fim.txt
echo Pronto! Canal Dark\VIDEO_FINAL_valdir_v2.mp4
