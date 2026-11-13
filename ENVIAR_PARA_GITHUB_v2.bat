@echo off
chcp 65001 >nul
title Canal Dark - Enviar para o GitHub
cd /d "%~dp0"
set REPO=https://github.com/eujoaosantana1/canal-dark.git
set LOG=envio_github_log.txt
echo INICIO %date% %time% > %LOG%

where git >nul 2>&1 || (echo Git nao encontrado. Instale com: winget install Git.Git & pause & exit /b)

if not exist .git (
  git init -b main >> %LOG% 2>&1
)
git config --get user.name >nul 2>&1 || git config user.name "eujoaosantana1"
git config --get user.email >nul 2>&1 || git config user.email "eujoaosantana1@users.noreply.github.com"

git add -A >> %LOG% 2>&1

echo.
echo ================= TRAVA DE SEGURANCA =================
git --no-pager diff --cached --name-only | findstr /i "chave" >nul
if not errorlevel 1 (
  echo ERRO: um arquivo com "chave" no nome ia subir. Envio cancelado.
  echo ERRO chave >> %LOG%
  git reset >nul 2>&1
  pause & exit /b
)
echo OK - a chave do Gemini NAO esta na lista.

echo.
echo ================= ARQUIVOS QUE VAO SUBIR =================
git --no-pager diff --cached --name-only
git --no-pager diff --cached --name-only >> %LOG%
for /f %%n in ('git --no-pager diff --cached --name-only ^| find /c /v ""') do set QTD=%%n
echo.
echo Total: %QTD% arquivos.
echo.
choice /C SN /M "Enviar esses arquivos para o GitHub agora (S = sim, N = nao)"
if errorlevel 2 (echo Cancelado. Nada foi enviado. & echo CANCELADO >> %LOG% & pause & exit /b)

git commit -m "Esteira do canal: codigo, roteiros e configuracoes" >> %LOG% 2>&1
git remote get-url origin >nul 2>&1 || git remote add origin %REPO%
echo.
echo Enviando... (na primeira vez o navegador abre para voce entrar no GitHub)
git push -u origin main >> %LOG% 2>&1
if errorlevel 1 (echo FALHOU - veja %LOG% e avise o Claude. & echo FALHOU >> %LOG%) else (echo PRONTO! Enviado para %REPO% & echo PRONTO >> %LOG%)
pause
