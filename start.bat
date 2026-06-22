@echo off
REM Betlandia - Quick Start Wrapper
REM Runs the PowerShell setup script with the correct execution policy

powershell.exe -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
pause
