import MetaTrader5 as mt5
from datetime import datetime

mt5.initialize()
acc = mt5.account_info()
print(f"Login: {acc.login}")

# Coba ambil deals all time
all_deals = mt5.history_deals_get(datetime(2020, 1, 1), datetime.now())
print(f"Total deals: {len(all_deals) if all_deals else 0}")
if all_deals:
    for d in all_deals:
        print(f"Ticket: {d.ticket}, Pos: {d.position_id}, Symbol: {d.symbol}, Profit: {d.profit}, Type: {d.type}, Entry: {d.entry}, Time: {datetime.fromtimestamp(d.time)}")

positions = mt5.positions_get()
print(f"Open positions: {len(positions) if positions else 0}")
if positions:
    for p in positions:
        print(f"Pos ID: {p.identifier}, Symbol: {p.symbol}, Type: {p.type}, Profit: {p.profit}")

orders = mt5.history_orders_get(datetime(2020, 1, 1), datetime.now())
print(f"Total history orders: {len(orders) if orders else 0}")

mt5.shutdown()
