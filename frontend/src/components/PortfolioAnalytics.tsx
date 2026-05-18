/**
 * PortfolioAnalytics — full analytics view for the active portfolio.
 *
 * Sections:
 *  1. Key metrics row  (invested, current value, total return, # holdings)
 *  2. Allocation donut chart  (per-stock breakdown)
 *  3. Strategy comparison bar chart  (when 2 strategies)
 *  4. Holdings performance table  (price, shares, value, day change, 5-day spark)
 *  5. Best & worst movers  (top-3 / bottom-3 stocks by day change)
 *  6. Market heatmap  (30 major stocks from the ticker)
 */

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart as PieChartIcon,
  Award,
  AlertTriangle,
  Activity,
  Layers,
} from "lucide-react";
import { fetchMarketTicker } from "@/lib/portfolioData";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stock {
  symbol: string;
  name: string;
  price: number;
  shares: number;
  allocation: number;      // % of total portfolio (0-100)
  value: number;
  change: number;          // intraday % change
  weeklyTrend?: { day: string; price: number }[];
  strategy?: string;
}

interface PortfolioAnalyticsProps {
  portfolio: {
    amount: number;
    stocks: Stock[];
    weeklyTrend: { day: string; value: number }[];
    totalValue: number;
    totalChange: number;
    strategies: string[];
  };
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
  "#EF4444", "#06B6D4", "#EC4899", "#84CC16",
  "#F97316", "#6366F1",
];

const STRATEGY_COLORS: Record<string, string> = {
  "Ethical Investing":  "#10B981",
  "Growth Investing":   "#3B82F6",
  "Index Investing":    "#F59E0B",
  "Quality Investing":  "#8B5CF6",
  "Value Investing":    "#EF4444",
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function signedPct(n: number) {
  return `${n >= 0 ? "+" : ""}${fmt(n)}%`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Tiny sparkline for the holdings table */
const Spark = ({ data }: { data?: { day: string; price: number }[] }) => {
  if (!data || data.length < 2) return <span className="text-muted-foreground text-xs">—</span>;
  const isUp = data[data.length - 1].price >= data[0].price;
  return (
    <ResponsiveContainer width={72} height={28}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={isUp ? "#10B981" : "#EF4444"}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/** Donut centre label rendered via a custom label function */
const renderCentreLabel = ({
  cx, cy, totalValue,
}: { cx: number; cy: number; totalValue: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
    <tspan x={cx} dy="-0.4em" fontSize="11" fill="hsl(215,15%,60%)">Total Value</tspan>
    <tspan x={cx} dy="1.4em" fontSize="14" fontWeight="700" fill="hsl(210,40%,98%)">
      ${(totalValue / 1000).toFixed(1)}k
    </tspan>
  </text>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const PortfolioAnalytics = ({ portfolio }: PortfolioAnalyticsProps) => {
  const { amount, stocks, totalValue, strategies } = portfolio;

  const [marketTicker, setMarketTicker] = useState<
    { symbol: string; price: number; change: number }[]
  >([]);
  const [tickerLoading, setTickerLoading] = useState(true);

  useEffect(() => {
    fetchMarketTicker()
      .then(setMarketTicker)
      .catch(() => setMarketTicker([]))
      .finally(() => setTickerLoading(false));
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────

  const isPositiveReturn = totalValue >= amount;
  const absoluteReturn = totalValue - amount;

  /** Allocation data for the donut chart */
  const allocationData = stocks.map((s, i) => ({
    name: s.symbol,
    fullName: s.name,
    value: s.value,
    pct: amount > 0 ? (s.value / amount) * 100 : 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  /** Strategy-level aggregation for bar chart */
  const strategyData = strategies.map((strat) => {
    const stratStocks = stocks.filter((s) => s.strategy === strat);
    const invested = stratStocks.reduce((sum, s) => sum + s.shares * s.price, 0);
    const allocated = amount / strategies.length; // approximate
    return {
      name: strat.replace(" Investing", ""),
      "Current Value": Math.round(invested * 100) / 100,
      "Allocated": Math.round(allocated * 100) / 100,
      color: STRATEGY_COLORS[strat] ?? "#3B82F6",
    };
  });

  /** Sort by intraday % change */
  const sortedByChange = [...stocks].sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
  const gainers = sortedByChange.filter((s) => (s.change ?? 0) > 0).slice(0, 3);
  const losers = sortedByChange.filter((s) => (s.change ?? 0) < 0).slice(-3).reverse();

  /** Market heatmap: sort by change descending */
  const heatmapStocks = [...marketTicker].sort((a, b) => b.change - a.change);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 fade-in-up">

      {/* ── 1. Key Metric Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Invested",
            value: `$${amount.toLocaleString()}`,
            sub: "Initial capital",
            icon: Layers,
            color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
            iconColor: "text-blue-400",
          },
          {
            label: "Current Value",
            value: `$${fmt(totalValue)}`,
            sub: isPositiveReturn ? "Earning" : "Below invested",
            icon: isPositiveReturn ? TrendingUp : TrendingDown,
            color: isPositiveReturn
              ? "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30"
              : "from-red-500/20 to-red-600/10 border-red-500/30",
            iconColor: isPositiveReturn ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Total Return",
            value: `${totalValue > amount ? "+" : totalValue < amount ? "-" : ""}${Math.abs(portfolio.totalChange).toFixed(2)}%`,
            sub: `$${fmt(Math.abs(absoluteReturn))} ${isPositiveReturn ? "gained" : "lost"}`,
            icon: Activity,
            color: isPositiveReturn
              ? "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30"
              : "from-red-500/20 to-red-600/10 border-red-500/30",
            iconColor: isPositiveReturn ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Holdings",
            value: `${stocks.length}`,
            sub: `${strategies.length} ${strategies.length === 1 ? "strategy" : "strategies"}`,
            icon: PieChartIcon,
            color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
            iconColor: "text-purple-400",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`kpi-card border bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{card.label}</p>
                  <p className="text-xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </div>
                <div className={`icon-bg bg-white/5 ${card.iconColor} rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. Allocation + Strategy Bar ───────────────────────────────── */}
      <div className={`grid gap-6 ${strategies.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-2"}`}>

        {/* Donut Chart */}
        <div className="premium-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
              <PieChartIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Portfolio Allocation</h3>
              <p className="text-xs text-muted-foreground">By stock value</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(217,33%,8%)",
                      border: "1px solid hsl(217,20%,18%)",
                      borderRadius: "10px",
                      color: "hsl(210,40%,98%)",
                    }}
                    formatter={(value: number, _name: string, props: any) => [
                      `$${fmt(value)} (${props.payload.pct.toFixed(1)}%)`,
                      props.payload.fullName,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2 w-full">
              {allocationData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                    <span className="text-xs text-muted-foreground truncate hidden md:block">
                      {entry.fullName}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-sm font-bold text-foreground">
                      {entry.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Comparison Bar Chart */}
        <div className="premium-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                {strategies.length > 1 ? "Strategy Comparison" : "Strategy Performance"}
              </h3>
              <p className="text-xs text-muted-foreground">Allocated vs Current value</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,20%,18%)" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(215,15%,60%)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(215,15%,60%)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(217,33%,8%)",
                    border: "1px solid hsl(217,20%,18%)",
                    borderRadius: "10px",
                    color: "hsl(210,40%,98%)",
                  }}
                  formatter={(value: number) => [`$${fmt(value)}`, ""]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "hsl(215,15%,60%)" }}
                />
                <Bar dataKey="Allocated" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.6} />
                <Bar dataKey="Current Value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 3. Holdings Table ───────────────────────────────────────────── */}
      <div className="premium-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Holdings Detail</h3>
            <p className="text-xs text-muted-foreground">
              All positions with live data
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {["Symbol", "Name", "Strategy", "Price", "Shares", "Alloc", "Value", "Day Chg", "5-Day"].map((h) => (
                  <th key={h} className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stocks.map((stock) => {
                const isUp = (stock.change ?? 0) >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <a
                        href={`https://finance.yahoo.com/quote/${stock.symbol}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-primary hover:underline"
                      >
                        {stock.symbol}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground max-w-[140px] truncate">
                      {stock.name}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${STRATEGY_COLORS[stock.strategy ?? ""] ?? "#3B82F6"}22`,
                          color: STRATEGY_COLORS[stock.strategy ?? ""] ?? "#3B82F6",
                        }}
                      >
                        {(stock.strategy ?? "—").replace(" Investing", "")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium">${fmt(stock.price)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{stock.shares.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-primary font-semibold">{stock.allocation}%</td>
                    <td className="py-3 pr-4 font-medium">
                      ${fmt(stock.value)}
                    </td>
                    <td className={`py-3 pr-4 font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      <span className="flex items-center gap-1">
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {signedPct(stock.change ?? 0)}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <Spark data={stock.weeklyTrend} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Best & Worst Movers ──────────────────────────────────────── */}
      {(gainers.length > 0 || losers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-bg bg-gradient-to-br from-emerald-500/30 to-emerald-600/10">
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Top Performers</h3>
                <p className="text-xs text-muted-foreground">Best intraday change</p>
              </div>
            </div>
            <div className="space-y-3">
              {gainers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No gainers today</p>
              ) : (
                gainers.map((s) => (
                  <div key={s.symbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{s.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{s.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{signedPct(s.change ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">${fmt(s.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Worst Performers */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-bg bg-gradient-to-br from-red-500/30 to-red-600/10">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Underperformers</h3>
                <p className="text-xs text-muted-foreground">Worst intraday change</p>
              </div>
            </div>
            <div className="space-y-3">
              {losers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No losers today</p>
              ) : (
                losers.map((s) => (
                  <div key={s.symbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{s.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{s.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{signedPct(s.change ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">${fmt(s.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Market Heatmap ───────────────────────────────────────────── */}
      <div className="premium-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Market Heatmap</h3>
            <p className="text-xs text-muted-foreground">
              30 major stocks — intraday % change
            </p>
          </div>
        </div>

        {tickerLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {heatmapStocks.map((stock) => {
              const isUp = stock.change >= 0;
              const intensity = Math.min(Math.abs(stock.change) / 3, 1); // normalise to 0-1
              const bg = isUp
                ? `rgba(16, 185, 129, ${0.15 + intensity * 0.45})`  // emerald
                : `rgba(239, 68, 68, ${0.15 + intensity * 0.45})`;   // red
              const border = isUp
                ? `rgba(16,185,129,${0.3 + intensity * 0.4})`
                : `rgba(239,68,68,${0.3 + intensity * 0.4})`;

              return (
                <a
                  key={stock.symbol}
                  href={`https://finance.yahoo.com/quote/${stock.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${stock.symbol} — $${fmt(stock.price)} (${signedPct(stock.change)})`}
                  className="flex flex-col items-center justify-center h-14 rounded-lg transition-transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                >
                  <span className="text-xs font-bold text-foreground leading-tight">{stock.symbol}</span>
                  <span
                    className={`text-xs font-semibold mt-0.5 ${isUp ? "text-emerald-300" : "text-red-300"}`}
                  >
                    {signedPct(stock.change)}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Click any cell to open the stock on Yahoo Finance
        </p>
      </div>

    </div>
  );
};

export default PortfolioAnalytics;
