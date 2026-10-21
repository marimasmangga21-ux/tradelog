import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

os.makedirs('public/strategies', exist_ok=True)

def draw_candle(ax, x, o, h, l, c, width=0.6, bull_color='#b2ff05', bear_color='#ff4d4d'):
    bull = c >= o
    color = bull_color if bull else bear_color
    # Wick
    ax.plot([x, x], [l, h], color=color, linewidth=1.5, zorder=2)
    # Body
    low_b = min(o, c)
    height = max(abs(c - o), 0.05)
    rect = patches.Rectangle(
        (x - width/2, low_b),
        width,
        height,
        facecolor=color,
        edgecolor=color,
        zorder=3
    )
    ax.add_patch(rect)

def create_trend_following_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # Uptrend with pullback to EMA 20
    # 1. First impulsive wave
    draw_candle(ax, 1, 10.0, 11.2, 9.8, 11.0)
    draw_candle(ax, 2, 11.0, 12.5, 10.9, 12.3)
    draw_candle(ax, 3, 12.3, 13.6, 12.1, 13.4) # Swing High 1 (HH)

    # 2. Pullback wave
    draw_candle(ax, 4, 13.4, 13.5, 12.2, 12.4)
    draw_candle(ax, 5, 12.4, 12.6, 11.4, 11.6) # Pullback to EMA
    draw_candle(ax, 6, 11.6, 12.4, 11.2, 12.2) # Rejection Pinbar / Hammer touching EMA!

    # 3. Second impulsive wave
    draw_candle(ax, 7, 12.2, 13.8, 12.0, 13.6) # Resumption
    draw_candle(ax, 8, 13.6, 15.2, 13.5, 15.0)
    draw_candle(ax, 9, 15.0, 16.0, 14.8, 15.8) # Swing High 2 (New HH)

    # 4. Pullback wave 2
    draw_candle(ax, 10, 15.8, 15.9, 14.5, 14.6)
    draw_candle(ax, 11, 14.6, 14.8, 13.6, 13.8) # Touches EMA
    draw_candle(ax, 12, 13.8, 14.9, 13.5, 14.7) # Bullish Engulfing confirmation

    # 5. Third wave
    draw_candle(ax, 13, 14.7, 16.5, 14.6, 16.3)
    draw_candle(ax, 14, 16.3, 17.5, 16.1, 17.3)

    # Dynamic EMA 20 curve
    xs = np.linspace(0.8, 14.5, 100)
    # EMA follows a smooth uptrend curve underneath the pullbacks (at x=6 y=11.4, at x=11 y=13.7)
    ys = 9.8 + 0.52 * xs + 0.003 * (xs**2)
    ax.plot(xs, ys, color='#00d2ff', linewidth=2.2, linestyle='-', label='EMA 20 (Dynamic Support)', zorder=4)

    # Annotations
    ax.text(3, 14.0, 'Swing High (HH)', color='#a0a0a0', fontsize=8, ha='center')
    ax.text(6, 10.4, 'Pullback to EMA 20\n(Pinbar Rejection)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')
    ax.text(6, 12.8, 'ENTRY 1', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')

    ax.text(9, 16.4, 'Target TP 1', color='#b2ff05', fontsize=8, ha='center')

    ax.text(12, 12.7, 'Pullback to EMA\n(Engulfing)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')
    ax.text(12, 15.3, 'ENTRY 2', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')

    # SL marker on pullback 1
    ax.plot([5.5, 6.5], [11.0, 11.0], color='#ff4d4d', linestyle='--', linewidth=1.2)
    ax.text(6, 10.8, 'SL (Below Swing Low)', color='#ff4d4d', fontsize=7, ha='center', va='top')

    ax.text(13.5, 16.8, 'EMA 20 Dynamic Support', color='#00d2ff', fontsize=8, fontweight='bold')

    ax.set_title("TREND FOLLOWING & PULLBACK  ·  Dynamic EMA 20 Bounce & Market Structure", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 15.5)
    ax.set_ylim(9.0, 18.2)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/trend-following.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("Trend Following diagram created.")

def create_session_breakout_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # Asian Range Consolidation (x=1 to 5)
    # Range is between 10.0 (Low) and 11.5 (High)
    draw_candle(ax, 1, 10.5, 11.2, 10.2, 11.0)
    draw_candle(ax, 2, 11.0, 11.4, 10.4, 10.6)
    draw_candle(ax, 3, 10.6, 10.8, 10.1, 10.3)
    draw_candle(ax, 4, 10.3, 11.1, 10.2, 10.9)
    draw_candle(ax, 5, 10.9, 11.3, 10.6, 11.1)

    # Asian Range Box
    asian_box = patches.Rectangle((0.5, 10.0), 5.0, 1.5, facecolor='#262626', alpha=0.35, edgecolor='#5c5c5c', linestyle='--')
    ax.add_patch(asian_box)
    ax.text(3, 9.5, 'ASIAN SESSION RANGE (Consolidation)', color='#a0a0a0', fontsize=8, fontweight='bold', ha='center')

    # Asian High & Low lines
    ax.axhline(y=11.5, xmin=0.05, xmax=0.55, color='#ffaa00', linestyle='--', linewidth=1.2)
    ax.text(0.6, 11.7, 'Asian High', color='#ffaa00', fontsize=8, fontweight='bold')
    ax.axhline(y=10.0, xmin=0.05, xmax=0.38, color='#ffaa00', linestyle='--', linewidth=1.2)
    ax.text(0.6, 9.8, 'Asian Low', color='#ffaa00', fontsize=8)

    # London Open Breakout Candle (x=6)
    draw_candle(ax, 6, 11.1, 13.0, 11.0, 12.8) # Explosive Bullish Candle!
    ax.text(6, 13.3, 'LONDON OPEN\nBreakout Candle', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')

    # Pullback / Retest to Asian High (x=7, 8)
    draw_candle(ax, 7, 12.8, 12.9, 11.8, 12.0)
    draw_candle(ax, 8, 12.0, 12.2, 11.5, 11.9) # Retest exactly at 11.5!

    # Retest Entry marker
    ax.text(8, 11.1, 'ENTRY (Retest Asian High)', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')

    # SL marker inside range
    ax.plot([7.5, 8.5], [10.8, 10.8], color='#ff4d4d', linestyle='--', linewidth=1.2)
    ax.text(8, 10.5, 'SL (Mid-Point Range)', color='#ff4d4d', fontsize=7, ha='center')

    # New York Session Expansion (x=9, 10, 11, 12)
    draw_candle(ax, 9, 11.9, 13.4, 11.8, 13.2)
    draw_candle(ax, 10, 13.2, 14.5, 13.0, 14.3)
    draw_candle(ax, 11, 14.3, 14.8, 14.0, 14.6)
    draw_candle(ax, 12, 14.6, 16.0, 14.5, 15.8) # TP Hit

    ax.text(11, 15.5, 'NEW YORK SESSION\nExpansion Wave', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')
    ax.text(12, 16.4, 'Target TP (ADR / High)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("LONDON / NY BREAKOUT  ·  Asian Range Expansion & Session Momentum", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 14)
    ax.set_ylim(8.8, 17.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/session-breakout.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("Session Breakout diagram created.")

def create_gold_scalping_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # Psychological Round Level .00 / .50 Scalping on Gold
    # 1. Approach to round level 4170.00
    draw_candle(ax, 1, 4165.0, 4167.2, 4164.8, 4166.8)
    draw_candle(ax, 2, 4166.8, 4168.9, 4166.5, 4168.4)
    draw_candle(ax, 3, 4168.4, 4170.5, 4168.1, 4170.0) # Hits round level

    # Round Level Line 4170.00
    ax.axhline(y=4170.0, xmin=0.05, xmax=0.9, color='#00d2ff', linestyle='--', linewidth=1.5)
    ax.text(0.6, 4170.6, 'Level Psikologis 4170.00 (Key Round Number)', color='#00d2ff', fontsize=8, fontweight='bold')

    # Rejection Wick at Round Level
    draw_candle(ax, 4, 4170.0, 4171.2, 4168.0, 4168.4) # Long upper wick rejection
    ax.text(4, 4172.0, 'Wick Rejection\n(Pinbar M1/M5)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')

    # Entry on Rejection close
    ax.text(4, 4167.2, 'ENTRY (Short)', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')

    # SL just above wick
    ax.plot([3.5, 4.5], [4171.6, 4171.6], color='#ff4d4d', linestyle='--', linewidth=1.2)
    ax.text(4, 4172.8, 'SL (15 pips)', color='#ff4d4d', fontsize=7, ha='center')

    # Rapid dump
    draw_candle(ax, 5, 4168.4, 4168.6, 4165.2, 4165.5)
    draw_candle(ax, 6, 4165.5, 4166.0, 4162.8, 4163.2) # Fast TP hit
    draw_candle(ax, 7, 4163.2, 4164.0, 4160.0, 4160.5)

    ax.text(6, 4162.0, 'TP 1 Hit (+30 pips)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(7, 4159.2, 'Next Round Level 4160.00 (TP 2)', color='#00d2ff', fontsize=8, ha='center')

    ax.set_title("GOLD SCALPING (M1/M5)  ·  Psychological Round Level (.00/.50) Rejection", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 8.5)
    ax.set_ylim(4158.0, 4174.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/gold-scalping.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("Gold Scalping diagram created.")

if __name__ == '__main__':
    create_trend_following_diagram()
    create_session_breakout_diagram()
    create_gold_scalping_diagram()
