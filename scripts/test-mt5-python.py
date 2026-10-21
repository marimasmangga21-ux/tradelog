import MetaTrader5 as mt5
from datetime import datetime
import json
import urllib.request

if not mt5.initialize():
    print("MT5 initialize failed, error code =", mt5.last_error())
    quit()

account_info = mt5.account_info()
if account_info is None:
    print("Failed to get account info")
    mt5.shutdown()
    quit()

acc_number = account_info.login
broker = account_info.server
balance = account_info.balance
equity = account_info.equity
currency = account_info.currency
name = account_info.name

print(f"Connected to MT5: Login {acc_number}, Broker {broker}, Balance {balance} {currency}")

# Ambil seluruh history deals
from_date = datetime(2020, 1, 1)
to_date = datetime.now()
deals = mt5.history_deals_get(from_date, to_date)
print(f"Total deals found: {len(deals) if deals else 0}")

# Shutdown MT5 connection
mt5.shutdown()
