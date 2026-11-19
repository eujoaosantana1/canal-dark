$sig = '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);'
$k = Add-Type -MemberDefinition $sig -Name K -Namespace W -PassThru
$null = $k::SetThreadExecutionState([uint32]2147483649)
$alvo = (Get-Date).Date.AddHours(7).AddMinutes(5)
# se ja passou das 7h05, roda na hora
Write-Host "Esperando ate $alvo (o PC nao vai dormir enquanto esta janela estiver aberta)..."
while ((Get-Date) -lt $alvo) { Start-Sleep -Seconds 60 }
Set-Location $PSScriptRoot
Write-Host "Gerando as vozes (modelo principal)..."
cmd /c "echo.| .\2_gerar_vozes.bat"
$log = Get-Content '..\logs\vozes_semvoos.log' -Tail 5 | Out-String
if ($log -notmatch 'pendentes: 0') { Write-Host "Ainda faltam falas: tentando o Lite..."; cmd /c "echo.| .\2b_gerar_vozes_lite.bat" }
Write-Host "Montando e renderizando o video final..."
cmd /c "echo.| .\4_video_final.bat"
$null = $k::SetThreadExecutionState([uint32]2147483648)
Write-Host "FIM. Avise o Claude."
