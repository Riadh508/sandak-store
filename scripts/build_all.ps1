<#
.SYNOPSIS
    Sandak Store - Master Build Script for all products.
    بناء جميع أنظمة متجر سندك

.DESCRIPTION
    Checks prerequisites, builds Python EXEs with PyInstaller,
    then compiles Inno Setup installers for all 6 products
    and a combined installer.

.NOTES
    Author: Sandak Store
    Version: 1.0.0
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$BuildDir   = Split-Path -Parent $PSCommandPath
$ProjectDir = Resolve-Path "$BuildDir\.."
$Downloads  = "$ProjectDir\public\downloads"
$DistDir    = "$ProjectDir\dist"

# ============================================
# Helper Functions
# ============================================
function Write-Title {
    param([string]$Text)
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
}

function Write-Step {
    param([int]$Number, [string]$Text)
    Write-Host "`n[$Number/6] $Text" -ForegroundColor Yellow
}

function Test-Command {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# ============================================
# Prerequisites Check
# ============================================
Write-Title "Sandak Store - Build Script / بناء جميع أنظمة سندك"

Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check Python
if (-not (Test-Command "python")) {
    Write-Host "[ERROR] Python is not installed. Install Python 3.8+" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Python detected: $(python --version 2>&1)" -ForegroundColor Green

# Check Inno Setup
$isccPaths = @(
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 5\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 5\ISCC.exe"
)
$iscc = $null
foreach ($p in $isccPaths) {
    if (Test-Path $p) { $iscc = $p; break }
}
if (-not $iscc) {
    Write-Host "[ERROR] Inno Setup not found. Install from https://jrsoftware.org/isdl.php" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Inno Setup detected: $iscc" -ForegroundColor Green

# Create output directories
New-Item -ItemType Directory -Path $Downloads -Force | Out-Null
New-Item -ItemType Directory -Path $DistDir -Force | Out-Null

# ============================================
# Define Products
# ============================================
$products = @(
    @{ Name = "AccountingSystem"; Venv = "venv_accounting"; Src = "src\accounting\main.py"; Exe = "AccountingSystem.exe"; Iss = "AccountingSystem.iss" }
    @{ Name = "InvoiceSystem";    Venv = "venv_invoice";    Src = "src\invoice\main.py";    Exe = "InvoiceSystem.exe";    Iss = "InvoiceSystem.iss" }
    @{ Name = "POSSystem";        Venv = "venv_pos";        Src = "src\pos\main.py";        Exe = "POSSystem.exe";        Iss = "POSSystem.iss" }
    @{ Name = "SchoolSystem";     Venv = "venv_school";     Src = "src\school\main.py";     Exe = "SchoolSystem.exe";     Iss = "SchoolSystem.iss" }
    @{ Name = "HotelSystem";      Venv = "venv_hotel";      Src = "src\hotel\main.py";      Exe = "HotelSystem.exe";      Iss = "HotelSystem.iss" }
    @{ Name = "Archiver";         Venv = "venv_archiver";   Src = "src\archiver\main.py";   Exe = "Archiver.exe";         Iss = "Archiver.iss" }
)

# ============================================
# Step 1: Build Python EXEs with PyInstaller
# ============================================
Write-Title "Building Python executables with PyInstaller"

for ($i = 0; $i -lt $products.Count; $i++) {
    $prod = $products[$i]
    $step = $i + 1
    Write-Step $step "Building $($prod.Name)..."

    $venvPath = "$BuildDir\$($prod.Venv)"
    $srcPath  = "$ProjectDir\$($prod.Src)"
    $distPath = "$DistDir\$($prod.Name)"

    # Create venv if needed
    if (-not (Test-Path $venvPath)) {
        Write-Host "   Creating virtual environment..." -ForegroundColor Gray
        python -m venv $venvPath | Out-Null
    }

    # Activate and install deps
    $pip = "$venvPath\Scripts\pip.exe"
    $python = "$venvPath\Scripts\python.exe"

    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    & $pip install -r "$BuildDir\requirements.txt" -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [WARNING] pip install failed for $($prod.Name)" -ForegroundColor Yellow
    }

    # Build with PyInstaller
    if (Test-Path $srcPath) {
        Write-Host "   Running PyInstaller..." -ForegroundColor Gray
        New-Item -ItemType Directory -Path $distPath -Force | Out-Null
        & $python -m PyInstaller --onefile --windowed --name $($prod.Name) --distpath $distPath $srcPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] $($prod.Name) built successfully" -ForegroundColor Green
        } else {
            Write-Host "   [WARNING] PyInstaller failed for $($prod.Name)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [SKIP] Source not found: $srcPath" -ForegroundColor DarkYellow
    }

    # Clean up build artifacts
    if (Test-Path "$ProjectDir\$($prod.Name).spec") { Remove-Item "$ProjectDir\$($prod.Name).spec" -Force }
}

# Clean PyInstaller build cache
if (Test-Path "$ProjectDir\build") { Remove-Item "$ProjectDir\build" -Recurse -Force -ErrorAction SilentlyContinue }

# ============================================
# Step 2: Compile Inno Setup Installers
# ============================================
Write-Title "Compiling Inno Setup installers"

Write-Host "`nBuilding individual installers..." -ForegroundColor Yellow
foreach ($prod in $products) {
    $issFile = "$BuildDir\$($prod.Iss)"
    if (Test-Path $issFile) {
        Write-Host "   Compiling $($prod.Iss)..." -ForegroundColor Gray
        & $iscc $issFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] $($prod.Name) installer created" -ForegroundColor Green
        } else {
            Write-Host "   [ERROR] Failed to compile $($prod.Iss) (exit code: $LASTEXITCODE)" -ForegroundColor Red
        }
    } else {
        Write-Host "   [SKIP] File not found: $issFile" -ForegroundColor DarkYellow
    }
}

Write-Host "`nBuilding combined installer..." -ForegroundColor Yellow
$combinedIss = "$BuildDir\Combined.iss"
if (Test-Path $combinedIss) {
    & $iscc $combinedIss
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Combined installer created" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Failed to compile Combined.iss (exit code: $LASTEXITCODE)" -ForegroundColor Red
    }
}

# ============================================
# Summary
# ============================================
Write-Title "Build Complete / تم البناء بنجاح"

Write-Host "Output directory: $Downloads" -ForegroundColor Green
Write-Host "`nGenerated files:" -ForegroundColor White
Get-ChildItem $Downloads -Filter "*Setup.exe" -ErrorAction SilentlyContinue | ForEach-Object {
    $size = "{0:N0} KB" -f ($_.Length / 1KB)
    Write-Host "   - $($_.Name) ($size)" -ForegroundColor Cyan
}
Get-ChildItem $Downloads -Filter "*Setup.zip" -ErrorAction SilentlyContinue | ForEach-Object {
    $size = "{0:N0} KB" -f ($_.Length / 1KB)
    Write-Host "   - $($_.Name) ($size)" -ForegroundColor Cyan
}

Write-Host "`nDone!" -ForegroundColor Green
