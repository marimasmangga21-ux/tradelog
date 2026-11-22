/**
 * TRADELOG UI/UX SYSTEM DENGAN TOGGLE DUAL THEME (DARK & LIGHT)
 * 
 * Fitur:
 * 1. Theme Provider Context (Dark Mode & Light Mode) dengan persistensi local state.
 * 2. Toggle Switch Icon (Sun / Moon) dengan animasi transisi mulus.
 * 3. Dashboard Metrics Card responsif yang menyesuaikan palet warna Dark/Light.
 * 4. Kurva Pertumbuhan Ekuitas (AreaChart Recharts) adaptif tema.
 * 5. Tabel Riwayat Transaksi (Trades Data Table) adaptif tema.
 */

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

/* =========================================================================
 * 1. THEME CONTEXT & HOOK
 * ========================================================================= */
export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const saved = localStorage.getItem("tradelog-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      document.documentElement.classList.toggle("light-mode", saved === "light");
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("tradelog-theme", t);
    document.documentElement.classList.toggle("light-mode", t === "light");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={theme === "light" ? "light-mode" : "dark-mode"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

/* =========================================================================
 * 2. THEME TOGGLE BUTTON COMPONENT
 * ========================================================================= */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
        isLight ? "bg-zinc-200 border border-zinc-300" : "bg-[#18181b] border border-[#27272a]"
      }`}
      title={`Ganti ke mode ${isLight ? "gelap" : "terang"}`}
      aria-label="Toggle Dark and Light Mode"
    >
      <span
        className={`flex h-7 w-7 transform items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
          isLight
            ? "translate-x-7 bg-white text-amber-500"
            : "translate-x-0 bg-[#09090b] text-[#b2ff05]"
        }`}
      >
        {isLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </button>
  );
}

/* =========================================================================
 * 3. TYPES
 * ========================================================================= */
export interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  total_deposits?: number;
  initial_balance?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  status: "open" | "closed";
  result?: "win" | "loss" | "breakeven";
  lots: number;
  entry_price: number;
  close_price?: number;
  pnl?: number;
  open_time: string;
}

/* =========================================================================
 * 4. DUAL-THEME DASHBOARD VIEW
 * ========================================================================= */
export function DashboardDualTheme({
  accounts,
  trades,
}: {
  accounts: Account[];
  trades: Trade[];
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [privacy, setPrivacy] = React.useState(false);

  const closed = React.useMemo(() => trades.filter((t) => t.status === "closed"), [trades]);
  const wins = closed.filter((t) => t.result === "win");
  const losses = closed.filter((t) => t.result === "loss");

  const totalDeposit = accounts.reduce((sum, a) => sum + (a.total_deposits ?? a.initial_balance ?? 0), 0);
  const netPnl = closed.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const currentBalance = totalDeposit + netPnl;
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

  // Running balance chart data
  const chartData = React.useMemo(() => {
    let running = totalDeposit;
    return closed.map((t, idx) => {
      running += (t.pnl || 0);
      return { trade: `T${idx + 1}`, equity: running };
    });
  }, [closed, totalDeposit]);

  // Color tokens sesuai mode
  const colors = {
    bgApp: isLight ? "bg-[#f8fafc] text-zinc-900" : "bg-black text-[#f4f4f5]",
    card: isLight ? "bg-white border-zinc-200 shadow-sm" : "bg-[#0c0c0e] border-[#1e1e24] shadow-lg",
    subtext: isLight ? "text-zinc-500" : "text-zinc-400",
    chartStroke: isLight ? "#16a34a" : "#b2ff05",
    profitText: isLight ? "text-emerald-600" : "text-[#b2ff05]",
    lossText: isLight ? "text-red-600" : "text-red-400",
    tableHead: isLight ? "bg-zinc-100 text-zinc-600 border-zinc-200" : "bg-[#121215] text-zinc-400 border-[#1e1e24]",
    tableRowHover: isLight ? "hover:bg-zinc-50" : "hover:bg-white/[0.02]",
    tableBorder: isLight ? "divide-zinc-200" : "divide-[#18181c]"
  };

  return (
    <div className={`min-h-screen w-full p-6 transition-colors duration-300 font-sans ${colors.bgApp}`}>
      {/* Top Header Bar with Theme Toggle */}
      <div className="flex items-center justify-between pb-6 border-b mb-6 border-zinc-200 dark:border-[#1e1e24]">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Trading Overview</h1>
          <p className={`text-xs mt-0.5 ${colors.subtext}`}>Monitoring performa akun & log transaksi</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${colors.subtext}`}>
            {isLight ? "Mode Terang" : "Mode Gelap"}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Saldo */}
        <div className={`rounded-xl border p-5 transition-all duration-200 ${colors.card}`}>
          <div className={`flex items-center justify-between text-xs ${colors.subtext}`}>
            <span className="font-semibold tracking-wide">TOTAL SALDO</span>
            <button
              type="button"
              onClick={() => setPrivacy(!privacy)}
              className="hover:opacity-80 transition-opacity"
            >
              {privacy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono tracking-tight">
            {privacy ? "$ ••••••" : `$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </div>
          <p className={`mt-1 text-[11px] font-mono ${colors.subtext}`}>
            Deposit: ${totalDeposit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Net PnL */}
        <div className={`rounded-xl border p-5 transition-all duration-200 ${colors.card}`}>
          <div className={`flex items-center justify-between text-xs ${colors.subtext}`}>
            <span className="font-semibold tracking-wide">NET PROFIT / LOSS</span>
            {netPnl >= 0 ? (
              <TrendingUp className={`h-4 w-4 ${colors.profitText}`} />
            ) : (
              <TrendingDown className={`h-4 w-4 ${colors.lossText}`} />
            )}
          </div>
          <div className={`mt-3 text-3xl font-extrabold font-mono tracking-tight ${netPnl >= 0 ? colors.profitText : colors.lossText}`}>
            {privacy ? "$ ••••••" : `${netPnl >= 0 ? "+" : ""}$${netPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </div>
          <p className={`mt-1 text-[11px] font-mono ${colors.subtext}`}>
            {closed.length} Transaksi Selesai
          </p>
        </div>

        {/* Win Rate */}
        <div className={`rounded-xl border p-5 transition-all duration-200 ${colors.card}`}>
          <div className={`text-xs font-semibold tracking-wide ${colors.subtext}`}>WIN RATE</div>
          <div className="mt-3 text-3xl font-extrabold font-mono tracking-tight">
            {winRate.toFixed(1)}%
          </div>
          <p className={`mt-1 text-[11px] font-mono ${colors.subtext}`}>
            <span className={`font-bold ${colors.profitText}`}>{wins.length}W</span> · <span className={`font-bold ${colors.lossText}`}>{losses.length}L</span>
          </p>
        </div>

        {/* Total Eksekusi */}
        <div className={`rounded-xl border p-5 transition-all duration-200 ${colors.card}`}>
          <div className={`text-xs font-semibold tracking-wide ${colors.subtext}`}>TOTAL EKSEKUSI</div>
          <div className="mt-3 text-3xl font-extrabold font-mono tracking-tight">
            {trades.length}
          </div>
          <p className={`mt-1 text-[11px] font-mono ${colors.subtext}`}>
            {trades.filter((t) => t.status === "open").length} Posisi Terbuka
          </p>
        </div>
      </div>

      {/* Equity Performance Chart */}
      <div className={`mt-6 rounded-xl border p-6 transition-all duration-200 ${colors.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight">Kurva Pertumbuhan Ekuitas</h2>
            <p className={`text-xs ${colors.subtext}`}>Pertumbuhan saldo akun secara real-time</p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.chartStroke} stopOpacity={isLight ? 0.35 : 0.25} />
                  <stop offset="95%" stopColor={colors.chartStroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="trade" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isLight ? "#ffffff" : "#121215",
                  borderColor: isLight ? "#e2e8f0" : "#27272a",
                  borderRadius: "10px",
                  color: isLight ? "#0f172a" : "#ffffff",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                itemStyle={{ color: colors.chartStroke, fontWeight: "700" }}
              />
              <Area type="monotone" dataKey="equity" stroke={colors.chartStroke} strokeWidth={2.5} fill="url(#equityGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trades History Table */}
      <div className={`mt-6 overflow-hidden rounded-xl border transition-all duration-200 ${colors.card}`}>
        <div className="p-4 border-b flex items-center justify-between border-zinc-200 dark:border-[#1e1e24]">
          <h3 className="font-bold text-sm">Riwayat Transaksi</h3>
          <span className={`text-xs font-mono ${colors.subtext}`}>{trades.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`text-[11px] uppercase border-b ${colors.tableHead}`}>
              <tr>
                <th className="px-4 py-3">Simbol</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">Harga Masuk / Keluar</th>
                <th className="px-4 py-3 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${colors.tableBorder}`}>
              {trades.map((t) => {
                const isProfit = (t.pnl || 0) >= 0;
                return (
                  <tr key={t.id} className={`transition-colors ${colors.tableRowHover}`}>
                    <td className="px-4 py-3 font-bold">{t.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.type === "buy"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.lots.toFixed(2)}</td>
                    <td className={`px-4 py-3 ${colors.subtext}`}>
                      {t.entry_price} → {t.close_price || "-"}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${isProfit ? colors.profitText : colors.lossText}`}>
                      {isProfit ? "+" : ""}${Number(t.pnl || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
