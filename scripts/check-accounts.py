import MetaTrader5 as mt5

if not mt5.initialize():
    print(f"MT5 init failed: {mt5.last_error()}")
    quit()

acc = mt5.account_info()
if acc:
    print(f"CURRENT ACTIVE ACCOUNT: Login={acc.login}, Server={acc.server}, Name={acc.name}, Balance={acc.balance} {acc.currency}")
else:
    print("No active account info")

mt5.shutdown()
