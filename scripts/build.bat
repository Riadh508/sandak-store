@echo off
chcp 65001 >nul
title Sandak Store Build System
echo ============================================
echo  Sandak Store - Build Script
echo  بناء جميع أنظمة سندك
echo ============================================
echo.

set "BUILD_DIR=%~dp0"
set "PROJECT_DIR=%BUILD_DIR%.."
set "PUBLIC_DIR=%PROJECT_DIR%\public"
set "DOWNLOADS_DIR=%PUBLIC_DIR%\downloads"

:: Create output directories if they don't exist
if not exist "%DOWNLOADS_DIR%" mkdir "%DOWNLOADS_DIR%"
if not exist "%PROJECT_DIR%\dist" mkdir "%PROJECT_DIR%\dist"

:: ============================================
:: Step 1: Create Virtual Environments and Build EXEs
:: ============================================
echo [1/6] Building Accounting System...
if not exist "%BUILD_DIR%venv_accounting" (
    python -m venv "%BUILD_DIR%venv_accounting"
)
call "%BUILD_DIR%venv_accounting\Scripts\activate.bat"
pip install -r "%BUILD_DIR%requirements.txt" -q
if exist "%PROJECT_DIR%\src\accounting\main.py" (
    pyinstaller --onefile --windowed --name AccountingSystem --distpath "%PROJECT_DIR%\dist\AccountingSystem" "%PROJECT_DIR%\src\accounting\main.py"
) else (
    echo  WARNING: src\accounting\main.py not found, skipping PyInstaller
)
call "%BUILD_DIR%venv_accounting\Scripts\deactivate.bat"
echo.

echo [2/6] Building Invoice System...
if not exist "%BUILD_DIR%venv_invoice" (
    python -m venv "%BUILD_DIR%venv_invoice"
)
call "%BUILD_DIR%venv_invoice\Scripts\activate.bat"
pip install -r "%BUILD_DIR%requirements.txt" -q
if exist "%PROJECT_DIR%\src\invoice\main.py" (
    pyinstaller --onefile --windowed --name InvoiceSystem --distpath "%PROJECT_DIR%\dist\InvoiceSystem" "%PROJECT_DIR%\src\invoice\main.py"
) else (
    echo  WARNING: src\invoice\main.py not found, skipping PyInstaller
)
call "%BUILD_DIR%venv_invoice\Scripts\deactivate.bat"
echo.

echo [3/6] Building POS System...
if not exist "%BUILD_DIR%venv_pos" (
    python -m venv "%BUILD_DIR%venv_pos"
)
call "%BUILD_DIR%venv_pos\Scripts\activate.bat"
pip install -r "%BUILD_DIR%requirements.txt" -q
if exist "%PROJECT_DIR%\src\pos\main.py" (
    pyinstaller --onefile --windowed --name POSSystem --distpath "%PROJECT_DIR%\dist\POSSystem" "%PROJECT_DIR%\src\pos\main.py"
) else (
    echo  WARNING: src\pos\main.py not found, skipping PyInstaller
)
call "%BUILD_DIR%venv_pos\Scripts\deactivate.bat"
echo.

echo [4/6] Building School System...
if not exist "%BUILD_DIR%venv_school" (
    python -m venv "%BUILD_DIR%venv_school"
)
call "%BUILD_DIR%venv_school\Scripts\activate.bat"
pip install -r "%BUILD_DIR%requirements.txt" -q
if exist "%PROJECT_DIR%\src\school\main.py" (
    pyinstaller --onefile --windowed --name SchoolSystem --distpath "%PROJECT_DIR%\dist\SchoolSystem" "%PROJECT_DIR%\src\school\main.py"
) else (
    echo  WARNING: src\school\main.py not found, skipping PyInstaller
)
call "%BUILD_DIR%venv_school\Scripts\deactivate.bat"
echo.

echo [5/6] Building Hotel System...
if not exist "%BUILD_DIR%venv_hotel" (
    python -m venv "%BUILD_DIR%venv_hotel"
)
call "%BUILD_DIR%venv_hotel\Scripts\activate.bat"
pip install -r "%BUILD_DIR%requirements.txt" -q
if exist "%PROJECT_DIR%\src\hotel\main.py" (
    pyinstaller --onefile --windowed --name HotelSystem --distpath "%PROJECT_DIR%\dist\HotelSystem" "%PROJECT_DIR%\src\hotel\main.py"
) else (
    echo  WARNING: src\hotel\main.py not found, skipping PyInstaller
)
call "%BUILD_DIR%venv_hotel\Scripts\deactivate.bat"
echo.

echo [6/6] Building Archiver...
if not exist "%BUILD_DIR%venv_archiver" (
    python -m venv "%BUILD_DIR%venv_archiver"
)
call "%BUILD_DIR%venv_archiver\Scripts\activate.bat"
pip install -r "%BUILD_DIR%requirements.txt" -q
if exist "%PROJECT_DIR%\src\archiver\main.py" (
    pyinstaller --onefile --windowed --name Archiver --distpath "%PROJECT_DIR%\dist\Archiver" "%PROJECT_DIR%\src\archiver\main.py"
) else (
    echo  WARNING: src\archiver\main.py not found, skipping PyInstaller
)
call "%BUILD_DIR%venv_archiver\Scripts\deactivate.bat"
echo.

:: ============================================
:: Step 2: Run Inno Setup for each product
:: ============================================
echo.
echo ============================================
echo  Running Inno Setup Compilers
echo  تشغيل Inno Setup
echo ============================================
echo.

:: Detect Inno Setup path
set "ISCC="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "ISCC=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if exist "C:\Program Files (x86)\Inno Setup 5\ISCC.exe" set "ISCC=C:\Program Files (x86)\Inno Setup 5\ISCC.exe"
if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "ISCC=C:\Program Files\Inno Setup 6\ISCC.exe"
if exist "C:\Program Files\Inno Setup 5\ISCC.exe" set "ISCC=C:\Program Files\Inno Setup 5\ISCC.exe"

if "%ISCC%"=="" (
    echo [ERROR] Inno Setup not found! Please install Inno Setup 6.
    echo Install from: https://jrsoftware.org/isdl.php
    pause
    exit /b 1
)

echo Building individual installers...
"%ISCC%" "%BUILD_DIR%AccountingSystem.iss"
"%ISCC%" "%BUILD_DIR%InvoiceSystem.iss"
"%ISCC%" "%BUILD_DIR%POSSystem.iss"
"%ISCC%" "%BUILD_DIR%SchoolSystem.iss"
"%ISCC%" "%BUILD_DIR%HotelSystem.iss"
"%ISCC%" "%BUILD_DIR%Archiver.iss"

echo Building combined installer...
"%ISCC%" "%BUILD_DIR%Combined.iss"

echo.
echo ============================================
echo  Build Complete! / تم البناء بنجاح
echo  Output: %DOWNLOADS_DIR%
echo ============================================
pause
