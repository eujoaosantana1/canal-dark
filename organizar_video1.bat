@echo off
chcp 65001 >nul
cd /d "%~dp0"
set DEST=01 - Imposto Vida Inteira
if not exist "%DEST%" mkdir "%DEST%"
echo Movendo arquivos do primeiro video...
> logs\organizar.log echo inicio
if exist "VIDEO_FINAL_valdir.mp4" move /Y "VIDEO_FINAL_valdir.mp4" "%DEST%\" >> logs\organizar.log 2>&1
if exist "VIDEO_FINAL_valdir_v2.mp4" move /Y "VIDEO_FINAL_valdir_v2.mp4" "%DEST%\" >> logs\organizar.log 2>&1
if exist "VIDEO_FINAL_valdir_v3.mp4" move /Y "VIDEO_FINAL_valdir_v3.mp4" "%DEST%\" >> logs\organizar.log 2>&1
if exist "VIDEO_FINAL_valdir_v4.mp4" move /Y "VIDEO_FINAL_valdir_v4.mp4" "%DEST%\" >> logs\organizar.log 2>&1
if exist "valdir_nene_v2.zip" move /Y "valdir_nene_v2.zip" "%DEST%\" >> logs\organizar.log 2>&1
if exist "valdir_bia_v3.zip" move /Y "valdir_bia_v3.zip" "%DEST%\" >> logs\organizar.log 2>&1
if exist "valdir_v4.zip" move /Y "valdir_v4.zip" "%DEST%\" >> logs\organizar.log 2>&1
if exist "kit_v03_valdir.zip" move /Y "kit_v03_valdir.zip" "%DEST%\" >> logs\organizar.log 2>&1
if exist "narracao_valdir_clipes.zip" move /Y "narracao_valdir_clipes.zip" "%DEST%\" >> logs\organizar.log 2>&1
if exist "roteiro_imposto_vida_inteira.txt" move /Y "roteiro_imposto_vida_inteira.txt" "%DEST%\" >> logs\organizar.log 2>&1
if exist "conferencia_falas_v4.csv" move /Y "conferencia_falas_v4.csv" "%DEST%\" >> logs\organizar.log 2>&1
if exist "teste_placa_de_video.mp4" move /Y "teste_placa_de_video.mp4" "%DEST%\" >> logs\organizar.log 2>&1
if exist "teste_processador.mp4" move /Y "teste_processador.mp4" "%DEST%\" >> logs\organizar.log 2>&1
if exist "4_renderizar_valdir.bat" move /Y "4_renderizar_valdir.bat" "%DEST%\" >> logs\organizar.log 2>&1
if exist "5_renderizar_valdir_v2.bat" move /Y "5_renderizar_valdir_v2.bat" "%DEST%\" >> logs\organizar.log 2>&1
if exist "6_renderizar_valdir_v3.bat" move /Y "6_renderizar_valdir_v3.bat" "%DEST%\" >> logs\organizar.log 2>&1
if exist "7_renderizar_valdir_v4.bat" move /Y "7_renderizar_valdir_v4.bat" "%DEST%\" >> logs\organizar.log 2>&1
echo OK >> logs\organizar.log
echo Pronto! Arquivos movidos para %DEST%
