import MetaTrader5 as mt5
from datetime import datetime, timezone
import json
import urllib.request
import time

API_URL = "http://localhost:3000/api/mt5/ingest"
API_SECRET = "tradelog-mt5-secret-key"

def sync_trades():
    if not mt5.initialize():
        print(f"MT5 initialize failed: {mt5.last_error()}")
        return False

    acc = mt5.account_info()
    if not acc:
        print("Failed to get MT5 account info")
        mt5.shutdown()
        return False

    print(f"Connected to MT5: {acc.login} ({acc.server}) - Balance: {acc.balance} {acc.currency}")

    # Ambil deals dari 1 tahun terakhir
    from_date = datetime(2025, 1, 1)
    to_date = datetime.now()
    deals = mt5.history_deals_get(from_date, to_date)

    trades_map = {} # position_id -> trade object

    if deals:
        for d in deals:
            # Lewati deal balance / credit / deposit
            if d.entry not in (0, 1): # 0 = DEAL_ENTRY_IN, 1 = DEAL_ENTRY_OUT
                continue
            if d.type not in (0, 1): # 0 = DEAL_TYPE_BUY, 1 = DEAL_TYPE_SELL
                continue

            pos_id = d.position_id
            if pos_id not in trades_map:
                trades_map[pos_id] = {
                    "position_id": pos_id,
                    "symbol": d.symbol,
                    "type": "BUY" if d.type == 0 else "SELL",
                    "lots": d.volume,
                    "open_price": d.price,
                    "close_price": d.price,
                    "open_time": datetime.fromtimestamp(d.time, tz=timezone.utc).isoformat(),
                    "close_time": None,
                    "profit": 0.0,
                    "commission": 0.0,
                    "swap": 0.0,
                    "status": "OPEN",
                    "deal_in": None,
                    "deal_out": None
                }

            t = trades_map[pos_id]
            t["commission"] += d.commission
            t["swap"] += d.swap

            if d.entry == 0: # Entry IN
                t["deal_in"] = d.ticket
                t["open_price"] = d.price
                t["lots"] = d.volume
                t["type"] = "BUY" if d.type == 0 else "SELL"
                t["open_time"] = datetime.fromtimestamp(d.time, tz=timezone.utc).isoformat()
            elif d.entry == 1: # Entry OUT (Close)
                t["deal_out"] = d.ticket
                t["close_price"] = d.price
                t["close_time"] = datetime.fromtimestamp(d.time, tz=timezone.utc).isoformat()
                t["profit"] += d.profit
                t["status"] = "CLOSED"

    # Ambil open positions yang saat ini sedang aktif
    positions = mt5.positions_get()
    if positions:
        for p in positions:
            pos_id = p.identifier
            trades_map[pos_id] = {
                "position_id": pos_id,
                "symbol": p.symbol,
                "type": "BUY" if p.type == 0 else "SELL",
                "lots": p.volume,
                "open_price": p.price_open,
                "close_price": p.price_current,
                "open_time": datetime.fromtimestamp(p.time, tz=timezone.utc).isoformat(),
                "close_time": None,
                "profit": p.profit,
                "commission": 0.0,
                "swap": p.swap,
                "stop_loss": p.sl,
                "take_profit": p.tp,
                "status": "OPEN"
            }

    trades_list = list(trades_map.values())
    print(f"Processed {len(trades_list)} positions from MT5.")

    payload = {
        "account_number": acc.login,
        "broker_server": acc.server,
        "account_name": f"{acc.server} {acc.login}",
        "balance": acc.balance,
        "equity": acc.equity,
        "currency": acc.currency,
        "trades": trades_list
    }

    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        API_URL,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "X-Tradelog-Secret": API_SECRET
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_body = res.read().decode('utf-8')
            print(f"SUCCESS Sync Response ({res.status}): {res_body}")
            return True
    except Exception as e:
        print(f"ERROR Failed to send trades to Tradelog: {e}")
        return False
    finally:
        mt5.shutdown()

if __name__ == "__main__":
    sync_trades()
