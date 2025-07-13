# PowerShell script to set Brave as default browser
# Run this once to set it permanently for your PowerShell session

$env:BROWSER = "brave"
Write-Host "Brave browser set as default. You can now run 'npm run dev' and it will open in Brave."
Write-Host "To make this permanent, add this line to your PowerShell profile:"
Write-Host '$env:BROWSER = "brave"' 