import MetaTrader5 as mt5
from datetime import datetime, timezone

if mt5.initialize():
    t1 = datetime(2026, 10, 12, tzinfo=timezone.utc)
    t2 = datetime(2026, 10, 17, tzinfo=timezone.utc)
    mt5.symbol_select("XAUUSD.", True)
    rates = mt5.copy_rates_range("XAUUSD.", mt5.TIMEFRAME_M15, t1, t2)
    print("XAUUSD. rates count:", len(rates) if rates is not None else 0)
    mt5.shutdown()
