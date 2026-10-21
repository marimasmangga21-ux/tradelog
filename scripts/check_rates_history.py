import MetaTrader5 as mt5
from datetime import datetime, timezone

if not mt5.initialize():
    print("MT5 init failed")
    quit()

sym = "XAUUSDu"
# Ensure symbol is selected
mt5.symbol_select(sym, True)

t1 = datetime(2026, 10, 12, tzinfo=timezone.utc)
t2 = datetime(2026, 10, 17, tzinfo=timezone.utc)

for tf_name, tf in [("M5", mt5.TIMEFRAME_M5), ("M15", mt5.TIMEFRAME_M15), ("H1", mt5.TIMEFRAME_H1)]:
    rates = mt5.copy_rates_range(sym, tf, t1, t2)
    count = len(rates) if rates is not None else 0
    print(f"Rates for {sym} {tf_name}: {count}")

mt5.shutdown()
