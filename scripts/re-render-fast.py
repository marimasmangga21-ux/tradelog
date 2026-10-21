import os
import glob
from chart_generator import generate_trade_chart
import json
from datetime import datetime

# Ambil trade terakhir dari db
with open('data/tradelog.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

trade = db['trades'][0]
pos_id = trade['mt5_position_id']
symbol = trade['instrument']
open_dt = datetime.fromisoformat(trade['traded_at'].replace('Z', '+00:00')).replace(tzinfo=None)
close_dt = datetime.fromisoformat(trade['closed_at'].replace('Z', '+00:00')).replace(tzinfo=None) if trade.get('closed_at') else open_dt

print(f"Re-generating fast charts for {symbol} pos #{pos_id}...")
for tf_key, tf_str, tf_label in [("htf", "H1", "HTF"), ("mtf", "M15", "MTF"), ("ltf", "M5", "LTF")]:
    p = f"data/screenshots/trade_{pos_id}_{tf_key}.png"
    generate_trade_chart(
        symbol=symbol,
        open_dt=open_dt,
        close_dt=close_dt,
        entry_price=trade['entry_price'],
        exit_price=trade['exit_price'],
        sl_price=trade.get('stop_loss'),
        tp_price=trade.get('take_profit'),
        pnl=trade['pnl'],
        direction=trade['direction'].upper(),
        save_path=p,
        timeframe_str=tf_str,
        tf_label=tf_label
    )
    sz = os.path.getsize(p)
    print(f"Saved {p}: {sz / 1024:.1f} KB")
