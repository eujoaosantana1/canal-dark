@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo  Dia do Colapso - Epocas de Mexico: narracao + imagens
echo ============================================================
echo.
echo [1/2] Narracao (Google Cloud TTS, es-US, voz Algenib)...
python tools\narrar_chirp.py roteiro_epocas_mexico.txt narracao Algenib --idioma es-US
if errorlevel 1 (
  echo.
  echo A voz es-US falhou. Tentando es-ES...
  python tools\narrar_chirp.py roteiro_epocas_mexico.txt narracao Algenib --idioma es-ES
)
echo.
echo [2/2] Imagens (Gemini, 29 imagens 16:9)...
if not exist imagens mkdir imagens
cd imagens
python ..\tools\gerar_img.py gemini-3.1-flash-image
cd ..
echo.
echo Pronto. Narracao em: narracao\voiceover.wav  -  Imagens em: imagens\
echo Se alguma imagem deu ERRO, rode este arquivo de novo: ele so gera o que falta.
pause
