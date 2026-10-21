import json
from datetime import datetime
from chart_generator import generate_trade_chart

with open('data/tradelog.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Pick an old trade from the bottom of db.trades
old_trade = db['trades'][-1]
pos_id = old_trade['mt5_position_id']
op_dt = datetime.fromisoformat(old_trade['traded_at'].replace('Z', '+00:00')).replace(tzinfo=None)
cl_dt = datetime.fromisoformat(old_trade['closed_at'].replace('Z', '+00:00')).replace(tzinfo=None) if old_trade.get('closed_at') else op_dt

print(f"Testing old trade pos #{pos_id} at {op_dt}")

ok = generate_trade_chart(
    symbol=old_trade['broker_symbol'],
    open_dt=op_dt,
    close_dt=cl_dt,
    entry_price=old_trade['entry_price'],
    exit_price=old_trade['exit_price'],
    sl_price=old_trade.get('stop_loss'),
    tp_price=old_trade.get('take_profit'),
    pnl=old_trade['pnl'],
    direction=old_trade['direction'].upper(),
    save_path=f"data/screenshots/trade_{pos_id}_mtf.png",
    timeframe_str="M15",
    tf_label="MTF"
)
print(f"Success: {ok}")
