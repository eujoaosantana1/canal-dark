@echo off
chcp 65001 >nul
title Canal Dark - Continuar instalacao
cd /d "%~dp0"
call "%~dp0_ambiente.bat"
set VS_CHANNEL=msedge
set LOG=logs\continuar.log
echo INICIO %date% %time% > %LOG%
cd viralstick
echo [1/3] Pacotes Python...
"%PY%" -m pip install --upgrade numpy scipy faster-whisper >> ..\%LOG% 2>&1
echo [2/3] Conferindo kit...
"%PY%" tools\verify_kit.py > ..\logs\verify.log 2>&1
node -e "import('playwright').then(async p=>{const b=await p.chromium.launch({channel:'msedge'});console.log('EDGE_OK',b.version());await b.close()}).catch(e=>{console.log('EDGE_FALHOU',e.message)})" >> ..\%LOG% 2>&1
echo FIM %date% %time% >> ..\%LOG%
cd /d "%~dp0"
echo [3/3] Teste de velocidade...
call "%~dp0_teste.bat"
