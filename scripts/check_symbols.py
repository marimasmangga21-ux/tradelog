import MetaTrader5 as mt5

if mt5.initialize():
    acc = mt5.account_info()
    print(f"Logged in: {acc.login}")
    symbols = mt5.symbols_get()
    gold_syms = [s.name for s in symbols if "XAU" in s.name.upper() or "GOLD" in s.name.upper()]
    print(f"Gold symbols available: {gold_syms}")
    for g in gold_syms:
        rates = mt5.copy_rates_from_pos(g, mt5.TIMEFRAME_H1, 0, 50)
        print(f"Rates for {g}: {len(rates) if rates is not None else 0}")
    mt5.shutdown()
