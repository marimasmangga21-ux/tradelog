import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

os.makedirs('public/concepts', exist_ok=True)

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

def create_market_structure_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # Uptrend (HH & HL with BOS) -> CHoCH / MSS -> Downtrend (LH & LL with BOS)
    # Leg 1: Up to HH1
    draw_candle(ax, 1, 10.0, 11.2, 9.8, 11.0)
    draw_candle(ax, 2, 11.0, 12.8, 10.9, 12.5) # HH 1
    # Leg 2: Pullback to HL1
    draw_candle(ax, 3, 12.5, 12.6, 11.2, 11.4)
    draw_candle(ax, 4, 11.4, 11.8, 10.8, 11.6) # HL 1
    # Leg 3: Breakout to HH2 (BOS 1)
    draw_candle(ax, 5, 11.6, 13.5, 11.5, 13.2)
    draw_candle(ax, 6, 13.2, 15.0, 13.0, 14.8) # HH 2
    # Leg 4: Pullback to HL2
    draw_candle(ax, 7, 14.8, 14.9, 13.2, 13.4)
    draw_candle(ax, 8, 13.4, 13.8, 12.8, 13.6) # HL 2
    # Leg 5: Breakout to HH3
    draw_candle(ax, 9, 13.6, 15.5, 13.5, 15.2)
    draw_candle(ax, 10, 15.2, 16.5, 15.0, 16.2) # HH 3 (Highest Point)

    # Leg 6: Heavy reversal drop breaking HL2 (MSS / CHoCH)
    draw_candle(ax, 11, 16.2, 16.3, 13.0, 13.1)
    draw_candle(ax, 12, 13.1, 13.2, 11.8, 12.0) # LL 1 (Breaks 12.8!)
    
    # Leg 7: Pullback to LH1
    draw_candle(ax, 13, 12.0, 13.8, 11.9, 13.5) # LH 1
    # Leg 8: Continuation drop (Bearish BOS)
    draw_candle(ax, 14, 13.5, 13.6, 10.5, 10.8) # LL 2

    # Annotations
    # BOS 1 line
    ax.axhline(y=12.5, xmin=0.12, xmax=0.38, color='#00d2ff', linestyle='--', linewidth=1.2)
    ax.text(4, 12.8, 'BOS (Break of Structure)', color='#00d2ff', fontsize=7, fontweight='bold', ha='center')

    # BOS 2 line
    ax.axhline(y=14.8, xmin=0.38, xmax=0.62, color='#00d2ff', linestyle='--', linewidth=1.2)
    ax.text(8, 15.1, 'BOS 2', color='#00d2ff', fontsize=7, fontweight='bold', ha='center')

    # Swing labels
    ax.text(2, 13.2, 'HH 1', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(4, 10.2, 'HL 1', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(6, 15.4, 'HH 2', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(8, 12.2, 'HL 2 (Key Swing)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')
    ax.text(10, 17.0, 'HH 3 (Peak)', color='#ffaa00', fontsize=8, fontweight='bold', ha='center')

    # CHoCH / MSS Break Line at HL2 (12.8)
    ax.axhline(y=12.8, xmin=0.5, xmax=0.82, color='#ff4d4d', linestyle='-', linewidth=1.5)
    ax.text(12, 12.3, 'MSS / CHoCH (Trend Shift)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')

    ax.text(12, 11.2, 'LL 1', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')
    ax.text(13, 14.2, 'LH 1 (Lower High)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')
    ax.text(14, 10.0, 'LL 2 (Bearish BOS)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("1. MARKET STRUCTURE  ·  Trend Phases, Swings (HH/HL/LH/LL), BOS & CHoCH/MSS", color='#f2f2f0', fontsize=11, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 15.5)
    ax.set_ylim(9.2, 18.0)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/concepts/market-structure.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("Market Structure diagram created.")

def create_poi_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # POI Concepts: Order Block (OB), Fair Value Gap (FVG), Support Turned Resistance (STR)
    # Zone 1: Support turned Resistance (x=1 to 4)
    draw_candle(ax, 1, 13.0, 13.2, 11.8, 12.0)
    draw_candle(ax, 2, 12.0, 12.5, 11.9, 12.2) # Support level 12.0
    draw_candle(ax, 3, 12.2, 12.3, 10.5, 10.6) # Clean break
    draw_candle(ax, 4, 10.6, 12.0, 10.5, 11.2) # Retest 12.0 now Resistance!

    # Zone 2: Order Block + FVG Formation (x=5 to 9)
    draw_candle(ax, 5, 11.2, 11.3, 9.4, 9.6)
    # Candle 6: Bullish Order Block (last down candle before massive pump)
    draw_candle(ax, 6, 9.6, 9.8, 8.0, 8.2, bull_color='#00d2ff', bear_color='#00d2ff')
    # Candle 7: Giant displacement candle creating FVG
    draw_candle(ax, 7, 8.2, 12.5, 8.1, 12.2)
    # Candle 8: Continuation pump
    draw_candle(ax, 8, 12.2, 14.5, 12.0, 14.2)
    # Candle 9: Peak
    draw_candle(ax, 9, 14.2, 15.2, 14.0, 15.0)

    # Zone 3: Retest to FVG & Order Block (x=10 to 12)
    draw_candle(ax, 10, 15.0, 15.1, 12.8, 13.0)
    draw_candle(ax, 11, 13.0, 13.2, 10.5, 10.8) # Enters FVG
    draw_candle(ax, 12, 10.8, 11.0, 8.2, 9.5) # Wick taps into Order Block (8.2)

    # Zone 4: Expansion out of POI (x=13 to 14)
    draw_candle(ax, 13, 9.5, 13.0, 9.4, 12.8)
    draw_candle(ax, 14, 12.8, 15.8, 12.7, 15.5)

    # Visual Boxes
    # 1. Order Block Box
    ob_box = patches.Rectangle((5.5, 8.0), 7.0, 1.8, facecolor='#00d2ff', alpha=0.18, edgecolor='#00d2ff', linestyle='--')
    ax.add_patch(ob_box)
    ax.text(5.2, 7.4, 'ORDER BLOCK (OB) ZONE', color='#00d2ff', fontsize=8, fontweight='bold')

    # 2. FVG Box (between Candle 6 high 9.8 and Candle 8 low 12.0)
    fvg_box = patches.Rectangle((6.8, 9.8), 5.0, 2.2, facecolor='#b2ff05', alpha=0.15, edgecolor='#b2ff05', linestyle=':')
    ax.add_patch(fvg_box)
    ax.text(9.3, 10.9, 'FAIR VALUE GAP (FVG)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')

    # 3. Support Turned Resistance Line
    ax.axhline(y=12.0, xmin=0.08, xmax=0.32, color='#ffaa00', linestyle='--', linewidth=1.2)
    ax.text(2.5, 12.3, 'Support Broken -> Resistance', color='#ffaa00', fontsize=7, fontweight='bold', ha='center')

    # Entry Annotations
    ax.text(12, 7.8, 'ENTRY (Tap into POI)', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')
    ax.text(14, 16.0, 'Reaction Target', color='#b2ff05', fontsize=8, ha='center')

    ax.set_title("2. POINT OF INTEREST (POI)  ·  Order Blocks, Fair Value Gaps (FVG) & Key Structural Levels", color='#f2f2f0', fontsize=11, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 15.5)
    ax.set_ylim(6.8, 16.8)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/concepts/poi-zones.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("POI diagram created.")

def create_liquidity_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # Liquidity Pools & Trigger: Equal Highs (EQH) -> Sweep / Hunt -> Reversal Entry
    # 1. First High (Resistance)
    draw_candle(ax, 1, 10.0, 12.0, 9.8, 11.8)
    draw_candle(ax, 2, 11.8, 13.0, 11.6, 12.8) # High 1 = 13.0
    draw_candle(ax, 3, 12.8, 12.9, 11.0, 11.2)

    # 2. Second High (Equal Highs - Retail Double Top Trap)
    draw_candle(ax, 4, 11.2, 11.8, 11.0, 11.6)
    draw_candle(ax, 5, 11.6, 13.0, 11.5, 12.9) # High 2 = 13.0 (EQH)
    draw_candle(ax, 6, 12.9, 13.0, 11.4, 11.7)

    # 3. Third High: Liquidity Sweep / Stop Hunt (Purge BSL above 13.0)
    draw_candle(ax, 7, 11.7, 12.6, 11.5, 12.4)
    # Candle 8: Giant wick piercing 13.0 to grab stop losses!
    draw_candle(ax, 8, 12.4, 14.5, 12.0, 12.2) # Wick reaches 14.5, closes at 12.2! (Huge rejection pinbar)

    # 4. Displacement Drop & Entry Trigger
    draw_candle(ax, 9, 12.2, 12.3, 10.0, 10.2) # Displacement candle
    # Candle 10: Retest entry
    draw_candle(ax, 10, 10.2, 11.5, 10.1, 11.3) # Trigger Entry candle
    
    # 5. Collapse down to Sell-Side Liquidity (SSL)
    draw_candle(ax, 11, 11.3, 11.4, 9.0, 9.2)
    draw_candle(ax, 12, 9.2, 9.3, 7.5, 7.8)

    # BSL Pool Line
    ax.axhline(y=13.0, xmin=0.1, xmax=0.6, color='#ffaa00', linestyle='--', linewidth=1.5)
    ax.text(3.5, 13.3, 'EQH / BSL (Buy-Side Liquidity Pool)', color='#ffaa00', fontsize=8, fontweight='bold', ha='center')
    ax.text(3.5, 12.4, 'Retail Double Top (Stop Loss Trap)', color='#a0a0a0', fontsize=7, ha='center')

    # Sweep Arrow & Marker
    ax.annotate(
        'LIQUIDITY SWEEP\n(Stop Hunt / Turtle Soup)',
        xy=(8, 14.5),
        xytext=(9.2, 15.3),
        color='#ff4d4d',
        fontsize=8,
        fontweight='bold',
        arrowprops=dict(arrowstyle='->', color='#ff4d4d', lw=1.2)
    )

    # Trigger marker
    ax.annotate(
        'EXECUTION TRIGGER\n(Short after Sweep)',
        xy=(10, 11.4),
        xytext=(11.0, 13.0),
        color='#b2ff05',
        fontsize=8,
        fontweight='bold',
        arrowprops=dict(arrowstyle='->', color='#b2ff05', lw=1.2)
    )

    # SSL Target Line
    ax.axhline(y=8.0, xmin=0.65, xmax=0.95, color='#00d2ff', linestyle=':', linewidth=1.2)
    ax.text(12, 7.2, 'SSL Target (Sell-Side Liquidity)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("3. LIQUIDITY & EXECUTION TRIGGER  ·  Equal Highs/Lows, Liquidity Sweep & Entry Confluence", color='#f2f2f0', fontsize=11, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 14.0)
    ax.set_ylim(6.5, 16.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/concepts/liquidity-triggers.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("Liquidity diagram created.")

if __name__ == '__main__':
    create_market_structure_diagram()
    create_poi_diagram()
    create_liquidity_diagram()
