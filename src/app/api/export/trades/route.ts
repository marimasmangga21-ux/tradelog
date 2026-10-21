import { loadAll } from "@/lib/data/queries";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const { trades, accounts, strategies } = await loadAll();

  const accountName = new Map(accounts.map((a) => [a.id, a.name]));
  const strategyName = new Map(strategies.map((s) => [s.id, s.name]));

  const header = [
    "tanggal", "instrument", "arah", "sesi", "status", "akun", "strategi",
    "entry", "stop_loss", "take_profit", "exit", "size",
    "pnl", "pnl_percent", "r_multiple", "hasil", "alasan_exit", "catatan",
  ];

  const rows = trades.map((t) =>
    [
      t.traded_at,
      t.instrument,
      t.direction,
      t.session,
      t.status,
      t.account_id ? (accountName.get(t.account_id) ?? "") : "",
      t.strategy_id ? (strategyName.get(t.strategy_id) ?? "") : "",
      t.entry_price,
      t.stop_loss,
      t.take_profit,
      t.exit_price,
      t.position_size,
      t.pnl,
      t.pnl_percent,
      t.r_multiple,
      t.result,
      t.exit_reason,
      t.notes,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\r\n");
  const filename = `tradelog-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
