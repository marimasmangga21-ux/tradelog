import MetaTrader5 as mt5
from datetime import datetime, timedelta, timezone
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.patches as patches
import numpy as np
import os
import re

TIMEFRAME_MAP = {
    "M1": mt5.TIMEFRAME_M1,
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1": mt5.TIMEFRAME_H1,
    "H4": mt5.TIMEFRAME_H4,
    "D1": mt5.TIMEFRAME_D1,
}

def resolve_symbol(symbol):
    clean = re.sub(r'[^A-Za-z0-9]', '', symbol).upper()
    # Deteksi base seperti XAUUSD
    base = "XAUUSD" if "XAU" in clean or "GOLD" in clean else clean[:6]
    
    candidates = [symbol, f"{base}.", f"{base}u", f"{base}.raw", f"{base}.pro", base]
    # Filter candidates
    all_symbols = [s.name for s in (mt5.symbols_get() or [])]
    
    for c in candidates:
        if c in all_symbols:
            mt5.symbol_select(c, True)
            return c
            
    # Fallback ke simbol pertama yang cocok
    for s in all_symbols:
        if base in s:
            mt5.symbol_select(s, True)
            return s
            
    return symbol

def generate_trade_chart(symbol, open_dt, close_dt, entry_price, exit_price, sl_price=None, tp_price=None, pnl=0.0, direction="BUY", save_path="chart.png", timeframe_str="M15", tf_label="MTF"):
    if not mt5.initialize():
        print(f"MT5 initialize error: {mt5.last_error()}")
        return False

    actual_symbol = resolve_symbol(symbol)
    tf = TIMEFRAME_MAP.get(timeframe_str, mt5.TIMEFRAME_M15)
    
    # Atur buffer waktu sesuai level timeframe
    if timeframe_str in ("H1", "H4", "D1"):
        start_buffer = open_dt - timedelta(days=2)
        end_buffer = (close_dt if close_dt else open_dt) + timedelta(days=1)
    elif timeframe_str in ("M15", "M30"):
        start_buffer = open_dt - timedelta(hours=6)
        end_buffer = (close_dt if close_dt else open_dt) + timedelta(hours=3)
    else: # M1, M5
        start_buffer = open_dt - timedelta(hours=1)
        end_buffer = (close_dt if close_dt else open_dt) + timedelta(minutes=45)
    
    rates = mt5.copy_rates_range(actual_symbol, tf, start_buffer, end_buffer)
    if rates is None or len(rates) == 0:
        rates = mt5.copy_rates_from(actual_symbol, tf, close_dt if close_dt else open_dt, 40)
        
    if rates is None or len(rates) == 0:
        print(f"No rates found for {symbol} / {actual_symbol} ({timeframe_str})")
        return False

    # Buat figure dengan tema obsidian dark Tradelog - dioptimasi agar ringan & cepat
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=96, facecolor='#090909')
    ax.set_facecolor('#090909')

    times = [datetime.fromtimestamp(r['time']) for r in rates]
    opens = [r['open'] for r in rates]
    highs = [r['high'] for r in rates]
    lows = [r['low'] for r in rates]
    closes = [r['close'] for r in rates]

    time_nums = mdates.date2num(times)
    candle_width = (time_nums[1] - time_nums[0]) * 0.75 if len(time_nums) > 1 else 0.005

    # Gambar Candlestick
    for i in range(len(rates)):
        t = time_nums[i]
        o = opens[i]
        h = highs[i]
        l = lows[i]
        c = closes[i]

        bullish = c >= o
        body_color = '#b2ff05' if bullish else '#ff4d4d'
        wick_color = '#b2ff05' if bullish else '#ff4d4d'

        # Garis wick (high-low)
        ax.plot([t, t], [l, h], color=wick_color, linewidth=1.1, zorder=2)

        # Body candle
        lower = min(o, c)
        height = max(abs(c - o), 0.0001)
        rect = patches.Rectangle(
            (t - candle_width / 2, lower),
            candle_width,
            height,
            facecolor=body_color,
            edgecolor=body_color,
            zorder=3
        )
        ax.add_patch(rect)

    # Garis ENTRY
    if entry_price:
        ax.axhline(y=entry_price, color='#4da3ff', linestyle='--', linewidth=1.2, alpha=0.85, label='Entry')
        ax.text(time_nums[0], entry_price, f'  ENTRY {entry_price:.2f}', color='#4da3ff', fontsize=8, fontweight='bold', va='center')

    # Garis EXIT
    if exit_price:
        exit_color = '#b2ff05' if pnl >= 0 else '#ff4d4d'
        ax.axhline(y=exit_price, color=exit_color, linestyle='--', linewidth=1.2, alpha=0.85, label='Exit')
        ax.text(time_nums[-1], exit_price, f'EXIT {exit_price:.2f}  ', color=exit_color, fontsize=8, fontweight='bold', va='center', ha='right')

    # SL / TP jika ada
    if sl_price and sl_price > 0:
        ax.axhline(y=sl_price, color='#ff4d4d', linestyle=':', linewidth=1.0, alpha=0.7)
        ax.text(time_nums[0], sl_price, f'  SL {sl_price:.2f}', color='#ff4d4d', fontsize=7, va='center')

    if tp_price and tp_price > 0:
        ax.axhline(y=tp_price, color='#b2ff05', linestyle=':', linewidth=1.0, alpha=0.7)
        ax.text(time_nums[0], tp_price, f'  TP {tp_price:.2f}', color='#b2ff05', fontsize=7, va='center')

    # Grid dan axis
    ax.grid(True, color='#1a1a1a', linestyle='-', linewidth=0.7, alpha=0.8)
    if timeframe_str in ("H1", "H4", "D1"):
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b %H:%M'))
    else:
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
    fig.autofmt_xdate(rotation=20, ha='right')

    ax.tick_params(axis='x', colors='#a0a0a0', labelsize=8)
    ax.tick_params(axis='y', colors='#a0a0a0', labelsize=8)
    for spine in ax.spines.values():
        spine.set_color('#1a1a1a')

    # Header Title
    pnl_sign = "+" if pnl >= 0 else ""
    pnl_str = f"{pnl_sign}{pnl:.2f}"
    
    title_text = f"{symbol}  ·  {tf_label.upper()} ({timeframe_str})  ·  {direction}  ·  PnL: {pnl_str}"
    ax.set_title(title_text, color='#f2f2f0', fontsize=11, fontweight='bold', pad=12, loc='left')

    plt.tight_layout()
    os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
    plt.savefig(save_path, facecolor='#090909', edgecolor='none', pil_kwargs={'optimize': True})
    plt.close(fig)
    return True
