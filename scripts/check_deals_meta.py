import MetaTrader5 as mt5
from datetime import datetime, timedelta

if mt5.initialize():
    deals = mt5.history_deals_get(datetime.now() - timedelta(days=7), datetime.now())
    if deals:
        for d in deals[:10]:
            print(f"Ticket: {d.ticket}, Magic: {d.magic}, Comment: '{d.comment}', Reason: {d.reason}")
    mt5.shutdown()
