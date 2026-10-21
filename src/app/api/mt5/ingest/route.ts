import { NextResponse } from "next/server";
import { readDb, mutateDb, recalcBalances, newId, nowIso } from "@/lib/store/db";
import { normalizeSymbol, detectSession } from "@/lib/mt5-utils";
import type { Trade, TradeResult, TradeDirection, TradeStatus, Account } from "@/lib/types";

interface Mt5IncomingTrade {
  position_id: number;
  deal_in?: number;
  deal_out?: number;
  symbol: string;
  type: "BUY" | "SELL"; // MT5 position direction
  lots: number;
  open_price: number;
  close_price: number;
  open_time: string; // ISO string UTC
  close_time?: string; // ISO string UTC
  profit: number; // gross profit
  commission: number; // biasanya negatif atau 0
  swap: number; // swap roll over
  stop_loss?: number;
  take_profit?: number;
  status: "OPEN" | "CLOSED";
}

interface Mt5Payload {
  account_number: number;
  broker_server: string;
  account_name?: string;
  balance?: number;
  equity?: number;
  currency?: string;
  total_deposits?: number;
  trades: Mt5IncomingTrade[];
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-tradelog-secret") || req.headers.get("authorization");
    const db = await readDb();

    // Default API Secret jika belum diset oleh user
    const currentSecret = db.profile.api_secret || "tradelog-mt5-secret-key";

    // Validasi Secret Key
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token || token !== currentSecret) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Invalid or missing X-Tradelog-Secret header." },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Mt5Payload;
    if (!body || !body.account_number || !Array.isArray(body.trades)) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload format. Required: account_number and trades array." },
        { status: 400 },
      );
    }

    const { account_number, broker_server, trades: incomingTrades, balance } = body;

    let importedCount = 0;
    let updatedCount = 0;
    let targetAccountId = "";

    await mutateDb((draft) => {
      // 1. Temukan atau Buat Akun MT5 yang sesuai
      let targetAccount = draft.accounts.find(
        (a: Account) => a.mt5_account_number === account_number || a.name.includes(String(account_number)),
      );

      const currentTime = nowIso();

      if (!targetAccount) {
        // Normalisasi mata uang cent jika broker melaporkan CNT / USC
        const rawCurr = (body.currency || "USD").toUpperCase();
        const accountCurrency = (rawCurr === "CNT" || rawCurr === "USC") ? "USC" : (rawCurr as any);

        const depositAmount = body.total_deposits ?? balance ?? 10000;
        // Buat akun baru otomatis bila belum ada
        targetAccount = {
          id: newId(),
          name: body.account_name || `MT5 ${account_number}`,
          broker: broker_server || "MT5 Broker",
          account_type: "broker",
          currency: accountCurrency,
          initial_balance: depositAmount,
          total_deposits: depositAmount,
          status: "active",
          profit_target: null,
          max_drawdown: null,
          color: "#b2ff05",
          notes: `Connected via MT5 EA on ${new Date().toLocaleDateString()}`,
          archived: false,
          mt5_account_number: account_number,
          mt5_server: broker_server,
          mt5_last_sync_at: currentTime,
          mt5_connected: true,
          created_at: currentTime,
          updated_at: currentTime,
        };
        draft.accounts.unshift(targetAccount);
      } else {
        // Update status akun & saldo deposit bila dikirim
        targetAccount.mt5_last_sync_at = currentTime;
        targetAccount.mt5_connected = true;
        if (body.total_deposits !== undefined && body.total_deposits > 0) {
          targetAccount.initial_balance = body.total_deposits;
          targetAccount.total_deposits = body.total_deposits;
        }
        if (broker_server) targetAccount.broker = broker_server;
        if (targetAccount.currency as string === "CNT") {
          targetAccount.currency = "USC";
        }
        targetAccount.updated_at = currentTime;
      }

      targetAccountId = targetAccount.id;

      // 2. Proses tiap trade dari MT5
      for (const item of incomingTrades) {
        if (!item.position_id) continue;

        const normalizedSymbol = normalizeSymbol(item.symbol);
        const direction: TradeDirection = item.type.toUpperCase() === "BUY" ? "long" : "short";
        const status: TradeStatus = item.status === "OPEN" ? "open" : "closed";

        // Hitung Net PnL = Gross Profit + Commission + Swap
        const netPnl = Number((item.profit + (item.commission || 0) + (item.swap || 0)).toFixed(2));

        let result: TradeResult = "open";
        if (status === "closed") {
          if (netPnl > 0.5) result = "win";
          else if (netPnl < -0.5) result = "loss";
          else result = "breakeven";
        }

        const session = detectSession(item.open_time || currentTime);

        // Cari apakah trade sudah pernah tersimpan dengan position_id ini
        const existingIndex = draft.trades.findIndex(
          (t: Trade) => t.account_id === targetAccountId && t.mt5_position_id === item.position_id,
        );

        // Jika tidak ada by position_id, cek apakah ada trade manual dengan instrument & waktu buka yang mirip (toleransi 5 menit)
        let manualIndex = -1;
        if (existingIndex === -1 && item.open_time) {
          const itemTime = new Date(item.open_time).getTime();
          manualIndex = draft.trades.findIndex((t: Trade) => {
            if (t.account_id !== targetAccountId || t.source === "mt5") return false;
            if (normalizeSymbol(t.instrument) !== normalizedSymbol) return false;
            const tTime = new Date(t.traded_at).getTime();
            return Math.abs(itemTime - tTime) < 5 * 60 * 1000; // 5 menit
          });
        }

        const targetIndex = existingIndex !== -1 ? existingIndex : manualIndex;
        let finalTradeId = "";

        if (targetIndex !== -1) {
          // UPDATE / REPLACE TRADE
          const oldTrade = draft.trades[targetIndex];
          finalTradeId = oldTrade.id;

          draft.trades[targetIndex] = {
            ...oldTrade,
            // Field broker (Overwrite dengan data MT5 resmi)
            instrument: normalizedSymbol,
            direction,
            status,
            entry_price: item.open_price || oldTrade.entry_price,
            exit_price: item.close_price || oldTrade.exit_price,
            stop_loss: item.stop_loss || oldTrade.stop_loss,
            take_profit: item.take_profit || oldTrade.take_profit,
            position_size: item.lots || oldTrade.position_size,
            pnl: netPnl,
            fees: Math.abs(item.commission || 0),
            commission: item.commission || 0,
            swap: item.swap || 0,
            result,
            traded_at: item.open_time || oldTrade.traded_at,
            closed_at: item.close_time || oldTrade.closed_at,
            session,
            source: "mt5",
            mt5_position_id: item.position_id,
            mt5_deal_in: item.deal_in,
            mt5_deal_out: item.deal_out,
            broker_symbol: item.symbol,
            updated_at: currentTime,
            // Field jurnal pengguna DIPERTAHANKAN (tidak tertimpa)
            notes: oldTrade.notes,
            tags: oldTrade.tags,
            exit_reason: oldTrade.exit_reason,
            strategy_id: oldTrade.strategy_id,
          };
          updatedCount++;
        } else {
          // INSERT TRADE BARU
          finalTradeId = newId();
          const newTrade: Trade = {
            id: finalTradeId,
            account_id: targetAccountId,
            strategy_id: null,
            traded_at: item.open_time || currentTime,
            closed_at: item.close_time || null,
            instrument: normalizedSymbol,
            direction,
            session,
            status,
            entry_price: item.open_price || null,
            stop_loss: item.stop_loss || null,
            take_profit: item.take_profit || null,
            exit_price: item.close_price || null,
            position_size: item.lots || null,
            pnl: netPnl,
            pnl_percent: null,
            fees: Math.abs(item.commission || 0),
            commission: item.commission || 0,
            swap: item.swap || 0,
            r_multiple: null,
            risk_amount: null,
            result,
            exit_reason: null,
            notes: `Auto-imported from MT5 (Position #${item.position_id})`,
            tags: ["mt5-sync"],
            balance_after: null,
            source: "mt5",
            mt5_position_id: item.position_id,
            mt5_deal_in: item.deal_in,
            mt5_deal_out: item.deal_out,
            broker_symbol: item.symbol,
            created_at: currentTime,
            updated_at: currentTime,
          };
          draft.trades.unshift(newTrade);
          importedCount++;
        }

        // Auto-link 3 Timeframe Chart Screenshots (HTF, MTF, LTF)
        const timeframes: Array<{ tf: "htf" | "mtf" | "ltf"; filename: string; label: string }> = [
          { tf: "htf", filename: `trade_${item.position_id}_htf.png`, label: "HTF (H1)" },
          { tf: "mtf", filename: `trade_${item.position_id}_mtf.png`, label: "MTF (M15)" },
          { tf: "ltf", filename: `trade_${item.position_id}_ltf.png`, label: "LTF (M5)" },
        ];

        for (const itemTf of timeframes) {
          const hasShot = draft.screenshots.some(
            (s) => s.trade_id === finalTradeId && s.timeframe === itemTf.tf,
          );
          if (!hasShot) {
            draft.screenshots.push({
              id: newId(),
              trade_id: finalTradeId,
              timeframe: itemTf.tf,
              storage_path: itemTf.filename,
              caption: `Auto MT5 Chart · ${itemTf.label}`,
              width: 1400,
              height: 728,
              created_at: currentTime,
            });
          }
        }
      }

      if (targetAccountId) {
        recalcBalances(draft, targetAccountId);
      }
    });

    return NextResponse.json({
      ok: true,
      message: `Sync success for account #${account_number}`,
      imported: importedCount,
      updated: updatedCount,
      total_processed: incomingTrades.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
