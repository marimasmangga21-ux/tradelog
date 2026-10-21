import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
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

def create_msnr_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # Candlestick pattern: Quasimodo (QM) / Fresh Body Level
    # 1. Left Shoulder Rally
    draw_candle(ax, 1, 10, 11.5, 9.8, 11.2)
    draw_candle(ax, 2, 11.2, 13.0, 11.0, 12.8) # Left Shoulder High (12.8 close)
    draw_candle(ax, 3, 12.8, 12.9, 10.8, 11.0)
    
    # 2. Valley / Low
    draw_candle(ax, 4, 11.0, 11.2, 9.5, 9.7)
    draw_candle(ax, 5, 9.7, 10.5, 9.6, 10.3)
    
    # 3. Head (Higher High - Liquidity grab)
    draw_candle(ax, 6, 10.3, 12.2, 10.1, 12.0)
    draw_candle(ax, 7, 12.0, 14.2, 11.8, 14.0) # Head peak
    draw_candle(ax, 8, 14.0, 14.1, 12.5, 12.6)
    
    # 4. Breakout down (Lower Low / Break of structure)
    draw_candle(ax, 9, 12.6, 12.7, 9.2, 9.3) # Heavy drop breaking previous low (9.5)
    draw_candle(ax, 10, 9.3, 9.6, 8.5, 8.7) # Lower Low
    
    # 5. Pullback to Left Shoulder level (approx 12.8)
    draw_candle(ax, 11, 8.7, 10.8, 8.6, 10.5)
    draw_candle(ax, 12, 10.5, 12.1, 10.4, 11.9)
    draw_candle(ax, 13, 11.9, 12.85, 11.8, 12.4) # Retest QML with wick touch
    
    # 6. Reversal Drop
    draw_candle(ax, 14, 12.4, 12.5, 10.2, 10.4)
    draw_candle(ax, 15, 10.4, 10.6, 8.2, 8.4)

    # Annotations
    qml_level = 12.8
    ax.axhline(y=qml_level, xmin=0.1, xmax=0.9, color='#00d2ff', linestyle='--', linewidth=1.5, zorder=4)
    ax.text(2, 13.3, 'Left Shoulder (High)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')
    ax.text(7, 14.5, 'Head (Higher High)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')
    ax.text(4.5, 9.0, 'Previous Low', color='#a0a0a0', fontsize=8, ha='center')
    ax.text(10, 8.0, 'Lower Low (Breakout)', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')
    ax.text(13, 13.2, 'ENTRY (QML Retest)', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')
    
    # Box QML zone
    rect_zone = patches.Rectangle((1.5, 12.6), 12, 0.4, facecolor='#00d2ff', alpha=0.15, edgecolor='#00d2ff', linestyle=':')
    ax.add_patch(rect_zone)
    ax.text(13.8, 12.8, ' Fresh Body Level', color='#00d2ff', fontsize=8, va='center')

    ax.set_title("MSNR SETUP  ·  Quasimodo (QM) & Fresh Body Level Reversal", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 16)
    ax.set_ylim(7.5, 15.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/msnr-setup.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("MSNR diagram created.")

def create_ict_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # ICT 2022 Model: BSL Sweep -> Displacement -> FVG -> OTE Entry
    # 1. Asian/Old High Range (BSL)
    draw_candle(ax, 1, 10.0, 11.2, 9.8, 11.0)
    draw_candle(ax, 2, 11.0, 12.0, 10.8, 11.8) # Old High
    draw_candle(ax, 3, 11.8, 11.9, 10.5, 10.8)
    draw_candle(ax, 4, 10.8, 11.4, 10.7, 11.2)

    # 2. Judas Swing / Liquidity Sweep (Purge BSL)
    draw_candle(ax, 5, 11.2, 13.2, 11.1, 12.8) # Sweep candle piercing 12.0
    
    # 3. Displacement Down (Displacement & FVG creation)
    # Candle 6 (Candle 1 of FVG): drop from 12.8 to 11.4, Low = 11.3
    draw_candle(ax, 6, 12.8, 12.9, 11.3, 11.5)
    # Candle 7 (Displacement Big Red): drop from 11.5 to 9.6
    draw_candle(ax, 7, 11.5, 11.6, 9.4, 9.6)
    # Candle 8 (Candle 3 of FVG): drop from 9.6 to 8.5, High = 9.8
    draw_candle(ax, 8, 9.6, 9.8, 8.4, 8.6)
    # Gap between Candle 6 Low (11.3) and Candle 8 High (9.8) = FVG!

    # 4. Continuation down breaking swing low (MSS)
    draw_candle(ax, 9, 8.6, 8.7, 7.6, 7.8) # MSS confirmed

    # 5. Retracement into FVG
    draw_candle(ax, 10, 7.8, 9.2, 7.7, 9.0)
    draw_candle(ax, 11, 9.0, 10.6, 8.9, 10.4) # Enters FVG (10.6 is between 9.8 and 11.3)
    
    # 6. Expansion down to SSL
    draw_candle(ax, 12, 10.4, 10.5, 8.8, 9.0)
    draw_candle(ax, 13, 9.0, 9.1, 7.0, 7.2)
    draw_candle(ax, 14, 7.2, 7.3, 6.0, 6.2) # TP hit

    # FVG Box
    fvg_box = patches.Rectangle((5.5, 9.8), 6, 1.5, facecolor='#b2ff05', alpha=0.15, edgecolor='#b2ff05', linestyle='--')
    ax.add_patch(fvg_box)
    ax.text(8.5, 10.55, 'FAIR VALUE GAP (FVG)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center', va='center')

    # BSL Line
    ax.axhline(y=12.0, xmin=0.1, xmax=0.45, color='#ffaa00', linestyle='--', linewidth=1.2)
    ax.text(2, 12.3, 'BSL (Buy-Side Liquidity)', color='#ffaa00', fontsize=8, fontweight='bold', ha='center')
    ax.text(5, 13.5, 'Liquidity Sweep', color='#ff4d4d', fontsize=8, fontweight='bold', ha='center')

    # MSS Line
    ax.axhline(y=10.5, xmin=0.2, xmax=0.65, color='#00d2ff', linestyle=':', linewidth=1.2)
    ax.text(9, 7.2, 'MSS (Market Structure Shift)', color='#00d2ff', fontsize=8, fontweight='bold', ha='center')

    # Entry point
    ax.text(11, 11.0, 'ENTRY (Short in FVG)', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')
    ax.text(14, 5.5, 'TP Target (SSL)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("ICT SETUP  ·  2022 Mentorship Model (Sweep + Displacement + FVG)", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 16)
    ax.set_ylim(5.0, 14.5)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/ict-setup.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("ICT diagram created.")

def create_smc_diagram():
    fig, ax = plt.subplots(figsize=(10, 5), dpi=140, facecolor='#090909')
    ax.set_facecolor('#090909')

    # SMC: Downtrend -> CHoCH -> Inducement (IDM) -> Order Block (OB) -> Expansion
    # 1. Downtrend leg
    draw_candle(ax, 1, 12.0, 12.2, 10.5, 10.7)
    draw_candle(ax, 2, 10.7, 11.2, 9.8, 10.0) # Lower High (11.2)
    
    # 2. Last red candle before bottom = Bullish Order Block (OB)
    draw_candle(ax, 3, 10.0, 10.1, 7.6, 7.8, bull_color='#00d2ff', bear_color='#00d2ff') # Highlighted OB!
    
    # 3. Strong Breakout / CHoCH
    draw_candle(ax, 4, 7.8, 9.5, 7.7, 9.3)
    draw_candle(ax, 5, 9.3, 11.8, 9.2, 11.6) # Breaks Lower High 11.2 -> CHoCH!
    draw_candle(ax, 6, 11.6, 12.8, 11.5, 12.5) # Peak High

    # 4. Pullback creating Inducement (IDM)
    draw_candle(ax, 7, 12.5, 12.6, 10.4, 10.6)
    draw_candle(ax, 8, 10.6, 11.4, 10.5, 11.2) # False retail support/bounce (IDM)
    
    # 5. Sweep IDM and Tap into Order Block
    draw_candle(ax, 9, 11.2, 11.3, 9.0, 9.2) # Break IDM
    draw_candle(ax, 10, 9.2, 9.3, 7.9, 8.1) # Taps Order Block zone (7.6 - 8.2)

    # 6. Continuation Rally (BOS)
    draw_candle(ax, 11, 8.1, 10.2, 8.0, 10.0)
    draw_candle(ax, 12, 10.0, 12.4, 9.9, 12.2)
    draw_candle(ax, 13, 12.2, 14.0, 12.0, 13.8) # BOS Target

    # OB Box
    ob_box = patches.Rectangle((2.5, 7.6), 8, 0.7, facecolor='#00d2ff', alpha=0.2, edgecolor='#00d2ff', linestyle='--')
    ax.add_patch(ob_box)
    ax.text(2.3, 7.1, 'BULLISH ORDER BLOCK (OB)', color='#00d2ff', fontsize=8, fontweight='bold')

    # CHoCH line
    ax.axhline(y=11.2, xmin=0.1, xmax=0.45, color='#b2ff05', linestyle='--', linewidth=1.2)
    ax.text(2, 11.5, 'Previous LH', color='#a0a0a0', fontsize=8)
    ax.text(5, 12.0, 'CHoCH (Change of Character)', color='#b2ff05', fontsize=8, fontweight='bold')

    # IDM Line
    ax.axhline(y=10.4, xmin=0.45, xmax=0.65, color='#ffaa00', linestyle=':', linewidth=1.2)
    ax.text(8, 10.0, 'IDM (Inducement Sweep)', color='#ffaa00', fontsize=8, fontweight='bold', ha='center')

    # Entry point
    ax.text(10, 7.3, 'ENTRY (Long at OB)', color='#b2ff05', fontsize=9, fontweight='bold', ha='center')
    ax.text(13, 14.3, 'Target High (BOS)', color='#b2ff05', fontsize=8, fontweight='bold', ha='center')

    ax.set_title("SMC SETUP  ·  CHoCH + Inducement Sweep + Order Block Entry", color='#f2f2f0', fontsize=12, fontweight='bold', pad=14, loc='left')
    ax.set_xlim(0, 15)
    ax.set_ylim(6.0, 15.0)
    ax.axis('off')

    plt.tight_layout()
    plt.savefig('public/strategies/smc-setup.png', facecolor='#090909', edgecolor='none')
    plt.close()
    print("SMC diagram created.")

if __name__ == '__main__':
    create_msnr_diagram()
    create_ict_diagram()
    create_smc_diagram()
