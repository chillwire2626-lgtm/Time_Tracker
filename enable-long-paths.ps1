# PowerShell script to enable long paths on Windows
# This script must be run as Administrator

Write-Host "Enabling long paths on Windows..." -ForegroundColor Green

try {
    # Check if running as administrator
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "This script must be run as Administrator!" -ForegroundColor Red
        Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
        exit 1
    }
    
    # Enable long paths via registry
    $registryPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
    $registryName = "LongPathsEnabled"
    $registryValue = 1
    
    # Check if the registry key exists
    if (Test-Path $registryPath) {
        $currentValue = Get-ItemProperty -Path $registryPath -Name $registryName -ErrorAction SilentlyContinue
        
        if ($currentValue -and $currentValue.LongPathsEnabled -eq 1) {
            Write-Host "Long paths are already enabled!" -ForegroundColor Green
        } else {
            Set-ItemProperty -Path $registryPath -Name $registryName -Value $registryValue
            Write-Host "Long paths have been enabled successfully!" -ForegroundColor Green
            Write-Host "You may need to restart your computer for the changes to take effect." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Registry path not found. This might not be a supported Windows version." -ForegroundColor Red
    }
    
    # Also try to enable via Group Policy (Windows 10/11)
    Write-Host "Attempting to enable via Group Policy..." -ForegroundColor Cyan
    
    # This command enables long paths for the current user
    $gpoPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Group Policy Objects\*\Machine\SYSTEM\CurrentControlSet\Policies"
    
    # Alternative method using local group policy
    $localGpoPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
    if (-not (Test-Path $localGpoPath)) {
        New-Item -Path $localGpoPath -Force | Out-Null
    }
    Set-ItemProperty -Path $localGpoPath -Name "EnableLongPaths" -Value 1 -Force
    
    Write-Host "Group Policy setting updated!" -ForegroundColor Green
    
} catch {
    Write-Host "An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nLong path configuration completed!" -ForegroundColor Green
Write-Host "Please restart your computer and then try building your Android project again." -ForegroundColor Yellow
