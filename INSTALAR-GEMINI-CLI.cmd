@echo off
chcp 65001 >nul
title Instalar Gemini CLI
echo Instalando o Gemini CLI (precisa do Node.js, que ja esta instalado)...
call npm install -g @google/gemini-cli
echo.
call gemini --version
echo.
echo Pronto. Para usar: abra o PowerShell, rode
echo    cd "$env:USERPROFILE\Downloads\Canal Dark"
echo    gemini
echo e escolha "Sign in with Google" com a sua conta do Google AI Pro.
pause
