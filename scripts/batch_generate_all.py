import json
import os
from datetime import datetime
from chart_generator import generate_trade_chart

with open('data/tradelog.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

trades = [t for t in db['trades'] if t.get('source') == 'mt5' and t.get('mt5_position_id')]
print(f"Total MT5 trades to check: {len(trades)}")

tf_configs = [
    ("htf", "H1", "HTF"),
    ("mtf", "M15", "MTF"),
    ("ltf", "M5", "LTF")
]

os.makedirs("data/screenshots", exist_ok=True)
count_generated = 0

for i, t in enumerate(trades):
    pos_id = t["mt5_position_id"]
    try:
        op_dt = datetime.fromisoformat(t["traded_at"].replace("Z", "+00:00")).replace(tzinfo=None)
        cl_dt = datetime.fromisoformat(t["closed_at"].replace("Z", "+00:00")).replace(tzinfo=None) if t.get("closed_at") else op_dt
    except Exception as e:
        continue

    for tf_key, tf_str, tf_label in tf_configs:
        chart_file = f"data/screenshots/trade_{pos_id}_{tf_key}.png"
        if not os.path.exists(chart_file) or os.path.getsize(chart_file) == 0:
            try:
                generate_trade_chart(
                    symbol=t.get("broker_symbol") or t.get("instrument") or "XAUUSD",
                    open_dt=op_dt,
                    close_dt=cl_dt,
                    entry_price=t.get("entry_price"),
                    exit_price=t.get("exit_price"),
                    sl_price=t.get("stop_loss"),
                    tp_price=t.get("take_profit"),
                    pnl=t.get("pnl", 0.0),
                    direction=(t.get("direction") or "BUY").upper(),
                    save_path=chart_file,
                    timeframe_str=tf_str,
                    tf_label=tf_label
                )
                count_generated += 1
            except Exception as ce:
                print(f"Error {pos_id} {tf_label}: {ce}")

    if (i + 1) % 10 == 0 or (i + 1) == len(trades):
        print(f"Progress: {i + 1}/{len(trades)} trades processed. Generated so far: {count_generated}")

print(f"Batch generation completed. Total new images generated: {count_generated}")
