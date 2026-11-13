@echo off
chcp 65001 >nul
title Canal Dark - Instalacao
cd /d "%~dp0"
if not exist logs mkdir logs
set LOG=logs\instalar.log
echo INICIO %date% %time% > %LOG%
echo [1/7] ffmpeg...
winget install --id Gyan.FFmpeg -e --scope user --silent --accept-source-agreements --accept-package-agreements >> %LOG% 2>&1
echo [2/7] Python...
winget install --id Python.Python.3.12 -e --scope user --silent --accept-source-agreements --accept-package-agreements >> %LOG% 2>&1
echo [3/7] Node.js (versao portatil, sem administrador)...
if not exist tools\node\node.exe powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $v=(Invoke-RestMethod https://nodejs.org/dist/index.json | Where-Object {$_.lts} | Select-Object -First 1).version; $z=\"node-$v-win-x64\"; New-Item -ItemType Directory -Force tools | Out-Null; Invoke-WebRequest \"https://nodejs.org/dist/$v/$z.zip\" -OutFile tools\node.zip; Expand-Archive -Force tools\node.zip tools; if (Test-Path tools\node) {Remove-Item -Recurse -Force tools\node}; Rename-Item \"tools\$z\" node; Remove-Item tools\node.zip; 'node ok ' + $v" >> %LOG% 2>&1
call "%~dp0_ambiente.bat"
echo --- versoes --- >> %LOG%
where ffmpeg >> %LOG% 2>&1
node -v >> %LOG% 2>&1
"%PY%" --version >> %LOG% 2>&1
if not exist viralstick\render.mjs (
  echo [4/7] Descompactando o kit...
  powershell -NoProfile -Command "Expand-Archive -Force 'viralstick-kit.zip' 'viralstick'" >> %LOG% 2>&1
)
cd viralstick
echo [5/7] Pacotes do renderizador (npm)...
call npm install >> ..\%LOG% 2>&1
echo [6/7] Navegador de renderizacao (Chromium)...
call npx playwright install chromium >> ..\%LOG% 2>&1
echo [7/7] Pacotes Python...
"%PY%" -m pip install --upgrade numpy scipy faster-whisper >> ..\%LOG% 2>&1
"%PY%" tools\verify_kit.py > ..\logs\verify.log 2>&1
"%PY%" tools\doctor.py > ..\logs\doctor.log 2>&1
type ..\logs\doctor.log
echo FIM %date% %time% >> ..\%LOG%
echo.
echo Instalacao concluida. Iniciando o teste de velocidade...
cd /d "%~dp0"
call "%~dp0_teste.bat"
