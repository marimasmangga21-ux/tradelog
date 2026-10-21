import MetaTrader5 as mt5
from datetime import datetime, timezone
import json
import urllib.request
import os
import sys

API_URL = "http://localhost:3000/api/mt5/ingest"
API_SECRET = "tradelog-mt5-secret-key"

def extract_current_account():
    """Hanya baca akun yang sedang aktif di MT5 tanpa login ulang / switch akun."""
    if not mt5.initialize():
        return None, f"MT5 initialize failed: {mt5.last_error()}"

    acc = mt5.account_info()
    if not acc:
        mt5.shutdown()
        return None, "No active MT5 account found"

    from_date = datetime(2025, 1, 1)
    to_date = datetime.now()
    deals = mt5.history_deals_get(from_date, to_date)

    trades_map = {}

    if deals:
        for d in deals:
            if d.entry not in (0, 1) or d.type not in (0, 1):
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

            if d.entry == 0:
                t["deal_in"] = d.ticket
                t["open_price"] = d.price
                t["lots"] = d.volume
                t["type"] = "BUY" if d.type == 0 else "SELL"
                t["open_time"] = datetime.fromtimestamp(d.time, tz=timezone.utc).isoformat()
            elif d.entry == 1:
                t["deal_out"] = d.ticket
                t["close_price"] = d.price
                t["close_time"] = datetime.fromtimestamp(d.time, tz=timezone.utc).isoformat()
                t["profit"] += d.profit
                t["status"] = "CLOSED"

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

    # Hitung total deposit dari balance deals (d.type == 2)
    net_deposits = sum(d.profit for d in deals if d.type == 2) if deals else 0.0

    trades_list = list(trades_map.values())

    payload = {
        "account_number": acc.login,
        "broker_server": acc.server,
        "account_name": f"{acc.server} {acc.login}",
        "balance": acc.balance,
        "equity": acc.equity,
        "currency": acc.currency,
        "total_deposits": round(net_deposits, 2) if net_deposits > 0 else acc.balance,
        "trades": trades_list
    }
    mt5.shutdown()
    return payload, None

def sync_active_account():
    payload, err = extract_current_account()
    if err or not payload:
        out = {"ok": False, "error": err or "Failed to read MT5"}
        print(json.dumps(out))
        return False

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
            res_body = json.loads(res.read().decode('utf-8'))
            out = {
                "ok": True,
                "account": payload["account_number"],
                "trades": len(payload["trades"]),
                "balance": payload["balance"],
                "currency": payload["currency"],
                "imported": res_body.get("imported", 0),
                "updated": res_body.get("updated", 0)
            }
            print(json.dumps(out))
            return True
    except Exception as e:
        out = {"ok": False, "error": f"API ingest failed: {e}"}
        print(json.dumps(out))
        return False

if __name__ == "__main__":
    sync_active_account()
