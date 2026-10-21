import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

def draw_candle(ax, x, o, h, l, c, width=0.6, bull_color='#b2ff05', bear_color='#ff4d4d'):
    bull = c >= o
    color = bull_color if bull else bear_color
    ax.plot([x, x], [l, h], color=color, linewidth=1.5, zorder=2)
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

def create_trend_following_perfect():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # 1. Impulsive wave 1
    draw_candle(ax, 1, 10.5, 11.6, 10.3, 11.4)
    draw_candle(ax, 2, 11.4, 12.8, 11.3, 12.6)
    draw_candle(ax, 3, 12.6, 14.0, 12.5, 13.8) # Swing High 1

    # 2. Pullback wave 1
    draw_candle(ax, 4, 13.8, 13.9, 12.6, 12.8)
    draw_candle(ax, 5, 12.8, 13.0, 11.8, 12.0)
    # Candle 6: Pinbar Hammer bouncing off EMA
    draw_candle(ax, 6, 12.0, 12.8, 11.2, 12.6) # Wick low = 11.2

    # 3. Impulsive wave 2
    draw_candle(ax, 7, 12.6, 14.2, 12.5, 14.0)
    draw_candle(ax, 8, 14.0, 15.6, 13.9, 15.4)
    draw_candle(ax, 9, 15.4, 16.8, 15.2, 16.5) # Swing High 2

    # 4. Pullback wave 2
    draw_candle(ax, 10, 16.5, 16.6, 15.0, 15.2)
    draw_candle(ax, 11, 15.2, 15.4, 14.2, 14.4)
    # Candle 12: Bullish Engulfing off EMA
    draw_candle(ax, 12, 14.4, 15.8, 14.0, 15.6) # Wick low = 14.0

    # 5. Impulsive wave 3
    draw_candle(ax, 13, 15.6, 17.5, 15.5, 17.3)
    draw_candle(ax, 14, 17.3, 18.8, 17.1, 18.5)

    # Smooth EMA 20 line
    xs_fit = [0.8, 3.0, 6.0, 9.0, 12.0, 14.5]
    ys_fit = [9.7, 10.4, 11.0, 12.6, 13.8, 15.6]
    poly = np.poly1d(np.polyfit(xs_fit, ys_fit, 3))
    xs_curve = np.linspace(0.8, 14.5, 100)
    ys_curve = poly(xs_curve)
    
    ax.plot(xs_curve, ys_curve, color='#00d2ff', linewidth=2.4, zorder=1)
    ax.text(14.6, 15.4, '  EMA 20 Dynamic Support', color='#00d2ff', fontsize=8, fontweight='bold', va='center')

    # Annotations positioned cleanly
    ax.text(3, 14.5, 'Swing High (HH 1)', color='#a0a0a0', fontsize=8, ha='center')
    
    # Entry 1 annotation with arrow
    ax.annotate(
        'ENTRY 1 (Pinbar)',
        xy=(6, 12.8),
        xytext=(5.2, 14.6),
        color='#b2ff05',
        fontsize=8,
        fontweight='bold',
        arrowprops=dict(arrowstyle='->', color='#b2ff05', lw=1.2)
    )
    ax.text(6, 10.2, 'Pullback to EMA 20', color='#00d2ff', fontsize=8, ha='center')
    ax.plot([5.3, 6.7], [10.6, 10.6], color='#ff4d4d', linestyle='--', linewidth=1.2)
    ax.text(6, 10.7, 'SL (Below Swing Low)', color='#ff4d4d', fontsize=7, ha='center', va='bottom')

    ax.text(9, 17.3, 'Target TP 1', color='#b2ff05', fontsize=8, ha='center')

    # Entry 2 annotation with arrow
    ax.annotate(
        'ENTRY 2 (Engulfing)',
        xy=(12, 15.8),
        xytext=(11.0, 17.6),
        color='#b2ff05',
        fontsize=8,
        fontweight='bold',
        arrowprops=dict(arrowstyle='->', color='#b2ff05', lw=1.2)
    )
    ax.text(12, 13.0, 'Pullback to EMA 20', color='#00d2ff', fontsize=8, ha='center')
    ax.plot([11.3, 12.7], [13.4, 13.4], color='#ff4d4d', linestyle='--', linewidth=1.2)
    ax.text(12, 13.5, 'SL 2', color='#ff4d4d', fontsize=7, ha='center', va='bottom')

    ax.text(14, 19.3, 'Target TP 2 (New HH)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("TREND FOLLOWING & PULLBACK  ·  Dynamic EMA 20 Bounce & Market Structure", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 17.0)
    ax.set_ylim(8.5, 20.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/trend-following.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("Perfect Trend Following diagram created.")

create_trend_following_perfect()
