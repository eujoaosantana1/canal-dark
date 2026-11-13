@echo off
chcp 65001 >nul
title Canal Dark - Renderizando o video do Valdir
cd /d "%~dp0"
call "%~dp0_ambiente.bat"
set VS_CHANNEL=msedge
if not exist logs mkdir logs
echo [1/4] Atualizando o kit (v0.3) e o projeto do Valdir...
powershell -NoProfile -Command "Expand-Archive -Force 'kit_v03_valdir.zip' 'viralstick'" > logs\final_extrair.log 2>&1
cd viralstick
echo [2/4] Renderizando as cenas (uns 6 a 10 minutos)...
node render.mjs --project projects/imposto-vida-inteira --gl gpu > ..\logs\final_render.log 2>&1
echo [3/4] Musica, efeitos e narracao...
"%PY%" audio\mix.py --project projects/imposto-vida-inteira > ..\logs\final_mix.log 2>&1
echo [4/4] Copiando o video final...
for %%f in ("projects\imposto-vida-inteira\out\*.mp4") do copy /Y /B "%%f" "..\VIDEO_FINAL_valdir.mp4" >> ..\logs\final_mix.log 2>&1
echo FINAL_OK > ..\logs\final_fim.txt
echo.
echo Pronto! O video esta em Canal Dark\VIDEO_FINAL_valdir.mp4
