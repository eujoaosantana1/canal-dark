@echo off
cd /d "%~dp0"
call "%~dp0_ambiente.bat"
if "%VS_CHANNEL%"=="" set VS_CHANNEL=msedge
if not exist logs mkdir logs
powershell -NoProfile -Command "Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors | Format-List; Get-CimInstance Win32_VideoController | Select-Object Name | Format-List; 'RAM_GB ' + [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)" > logs\pc.log
cd viralstick
echo Teste A: abertura (41 s) com a placa de video...
powershell -NoProfile -Command "$t=Measure-Command { node render.mjs --project examples/padaria-cartoon --gl gpu --out ..\teste_placa_de_video.mp4 2>&1 | Tee-Object -FilePath ..\logs\render_gpu.log | Out-Host }; 'SEGUNDOS_TOTAL ' + [int]$t.TotalSeconds | Out-File -Append -Encoding utf8 ..\logs\render_gpu.log"
echo Teste B: mesma abertura so com o processador...
powershell -NoProfile -Command "$t=Measure-Command { node render.mjs --project examples/padaria-cartoon --gl swiftshader --out ..\teste_processador.mp4 2>&1 | Tee-Object -FilePath ..\logs\render_cpu.log | Out-Host }; 'SEGUNDOS_TOTAL ' + [int]$t.TotalSeconds | Out-File -Append -Encoding utf8 ..\logs\render_cpu.log"
echo TESTE_CONCLUIDO > ..\logs\fim.txt
echo.
echo Tudo pronto. Pode fechar esta janela.
