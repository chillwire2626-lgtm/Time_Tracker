@echo off
echo ========================================
echo   Windows Long Path Fix for React Native
echo ========================================
echo.

echo This script will help fix the "Filename longer than 260 characters" error
echo that occurs when building React Native Android projects on Windows.
echo.

echo Method 1: Enable Long Paths via Registry (Requires Admin)
echo --------------------------------------------------------
echo.
echo Please run the following command as Administrator:
echo.
echo powershell -ExecutionPolicy Bypass -File "%~dp0enable-long-paths.ps1"
echo.
echo.

echo Method 2: Alternative Solutions
echo --------------------------------
echo.
echo 1. Move your project to a shorter path (e.g., C:\dev\TimeTracker)
echo 2. Use Windows Subsystem for Linux (WSL) for development
echo 3. Enable Developer Mode in Windows Settings
echo.

echo Method 3: Quick Registry Fix (Run as Admin)
echo -------------------------------------------
echo.
echo Run this command in an Administrator Command Prompt:
echo.
echo reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f
echo.

echo After applying any of these fixes, restart your computer and try building again.
echo.
pause
