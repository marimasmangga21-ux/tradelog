import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_candle(ax, x, o, h, l, c, width=0.55, bull_color='#b2ff05', bear_color='#ff4d4d'):
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

def fix_market_structure():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    draw_candle(ax, 1, 10.0, 11.2, 9.8, 11.0)
    draw_candle(ax, 2, 11.0, 12.8, 10.9, 12.5) # HH 1
    draw_candle(ax, 3, 12.5, 12.6, 11.2, 11.4)
    draw_candle(ax, 4, 11.4, 11.8, 10.8, 11.6) # HL 1
    draw_candle(ax, 5, 11.6, 13.5, 11.5, 13.2)
    draw_candle(ax, 6, 13.2, 15.0, 13.0, 14.8) # HH 2
    draw_candle(ax, 7, 14.8, 14.9, 13.2, 13.4)
    draw_candle(ax, 8, 13.4, 13.8, 12.8, 13.6) # HL 2
    draw_candle(ax, 9, 13.6, 15.5, 13.5, 15.2)
    draw_candle(ax, 10, 15.2, 16.5, 15.0, 16.2) # HH 3

    # Reversal
    draw_candle(ax, 11, 16.2, 16.3, 13.0, 13.1)
    draw_candle(ax, 12, 13.1, 13.2, 11.8, 12.0) # LL 1
    draw_candle(ax, 13, 12.0, 13.8, 11.9, 13.5) # LH 1
    draw_candle(ax, 14, 13.5, 13.6, 10.5, 10.8) # LL 2

    # BOS 1 & 2
    ax.axhline(y=12.5, xmin=0.12, xmax=0.38, color='#00d2ff', linestyle='--', linewidth=1.2)
    ax.text(4, 12.8, 'BOS (Break of Structure)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')
    ax.axhline(y=14.8, xmin=0.38, xmax=0.62, color='#00d2ff', linestyle='--', linewidth=1.2)
    ax.text(8, 15.1, 'BOS 2', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')

    ax.text(2, 13.2, 'HH 1', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(4, 10.2, 'HL 1', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(6, 15.4, 'HH 2', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(8, 12.1, 'HL 2 (Key Swing)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(10, 17.0, 'HH 3 (Peak)', color='#ffaa00', fontsize=8, fontweight='bold', ha='center')

    # CHoCH / MSS Line
    ax.axhline(y=12.8, xmin=0.5, xmax=0.88, color='#ff4d4d', linestyle='-', linewidth=1.5)
    ax.text(13.8, 12.9, '  MSS / CHoCH (Break of HL)', color='#ff4d4d', fontsize=8, fontweight='bold', va='center')

    ax.text(12, 11.2, 'LL 1', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')
    ax.text(13, 14.2, 'LH 1 (Lower High)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')
    ax.text(14, 10.0, 'LL 2 (Bearish BOS)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("1. MARKET STRUCTURE  ·  Trend Phases, Swings (HH/HL/LH/LL), BOS & CHoCH/MSS", color='#f2f2f0', fontsize=11, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 16.5)
    ax.set_ylim(9.2, 18.0)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/concepts/market-structure.png', facecolor='#090909', edgecolor='none')
    plt.close()

def fix_liquidity():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    draw_candle(ax, 1, 10.0, 12.0, 9.8, 11.8)
    draw_candle(ax, 2, 11.8, 13.0, 11.6, 12.8) # High 1
    draw_candle(ax, 3, 12.8, 12.9, 11.0, 11.2)
    draw_candle(ax, 4, 11.2, 11.8, 11.0, 11.6)
    draw_candle(ax, 5, 11.6, 13.0, 11.5, 12.9) # High 2 (EQH)
    draw_candle(ax, 6, 12.9, 13.0, 11.4, 11.7)
    draw_candle(ax, 7, 11.7, 12.6, 11.5, 12.4)
    # Candle 8: Sweep
    draw_candle(ax, 8, 12.4, 14.5, 12.0, 12.2)
    draw_candle(ax, 9, 12.2, 12.3, 10.0, 10.2)
    draw_candle(ax, 10, 10.2, 11.5, 10.1, 11.3)
    draw_candle(ax, 11, 11.3, 11.4, 9.0, 9.2)
    draw_candle(ax, 12, 9.2, 9.3, 7.5, 7.8)

    ax.axhline(y=13.0, xmin=0.1, xmax=0.6, color='#ffaa00', linestyle='--', linewidth=1.5)
    ax.text(3.5, 13.3, 'EQH / BSL (Buy-Side Liquidity Pool)', color='#ffaa00', fontsize=8, fontweight='bold', ha='center')
    ax.text(3.5, 10.3, 'Retail Double Top (Stop Loss Trap)', color='#8c8c8c', fontsize=8, ha='center')

    ax.annotate(
        'LIQUIDITY SWEEP\n(Stop Hunt / Turtle Soup)',
        xy=(8, 14.5),
        xytext=(9.2, 15.3),
        color='#ff4d4d',
        fontsize=8,
        fontweight='bold',
        arrowprops=dict(arrowstyle='->', color='#ff4d4d', lw=1.2)
    )

    ax.annotate(
        'EXECUTION TRIGGER\n(Short after Sweep)',
        xy=(10, 11.4),
        xytext=(11.0, 13.0),
        color='#b2ff05',
        fontsize=8,
        fontweight='bold',
        arrowprops=dict(arrowstyle='->', color='#b2ff05', lw=1.2)
    )

    ax.axhline(y=8.0, xmin=0.65, xmax=0.95, color='#00d2ff', linestyle=':', linewidth=1.2)
    ax.text(12, 7.2, 'SSL Target (Sell-Side Liquidity)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("3. LIQUIDITY & EXECUTION TRIGGER  ·  Equal Highs/Lows, Liquidity Sweep & Entry Confluence", color='#f2f2f0', fontsize=11, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 14.0)
    ax.set_ylim(6.5, 16.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/concepts/liquidity-triggers.png', facecolor='#090909', edgecolor='none')
    plt.close()

fix_market_structure()
fix_liquidity()
print("Fixed diagrams.")
