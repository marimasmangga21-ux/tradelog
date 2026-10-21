@echo off
title Tradelog MT5 Multi-Account Auto-Sync
cd /d "%~dp0"
echo ========================================================
echo   TRADELOG MT5 MULTI-ACCOUNT BACKGROUND WATCHER
echo ========================================================
echo Memonitor transaksi dan riwayat kedua akun MT5 secara real-time...
echo Tekan Ctrl+C untuk berhenti.
echo.
python scripts/mt5-watcher.py
pause
