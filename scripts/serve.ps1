param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "Serving $ProjectRoot at http://127.0.0.1:$Port/"

python -m http.server $Port --bind 127.0.0.1