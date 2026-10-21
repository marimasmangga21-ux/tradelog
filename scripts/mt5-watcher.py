import time
import os
import sys
from datetime import datetime

# Import sync_all_accounts from mt5_sync
from mt5_sync import sync_active_account as sync_all_accounts

INTERVAL_SECONDS = 15

print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Tradelog MT5 Multi-Account Auto-Sync started (interval: {INTERVAL_SECONDS}s)", flush=True)
print("Monitoring all connected MT5 accounts for new trades in real-time...", flush=True)

while True:
    try:
        sync_all_accounts()
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Auto-sync error: {e}", flush=True)
    time.sleep(INTERVAL_SECONDS)
