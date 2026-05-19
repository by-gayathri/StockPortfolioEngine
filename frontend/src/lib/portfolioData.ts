import { calculatePercentChange } from "@/lib/utils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

interface StrategyStocks {
  [key: string]: {
    symbol: string;
    name: string;
    price: number;
    change: number;
  }[];
}

export const strategyStocks: StrategyStocks = {
  ethical: [
    { symbol: "AAPL", name: "Apple Inc.", price: 278.28, change: 1.45 },
    { symbol: "ADBE", name: "Adobe Inc.", price: 512.45, change: -0.82 },
    { symbol: "NSRGY", name: "Nestlé S.A.", price: 98.76, change: 0.65 },
    { symbol: "CRM", name: "Salesforce Inc.", price: 342.18, change: 2.12 },
  ],
  growth: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 142.65,
      change: 3.28,
    },
    { symbol: "TSLA", name: "Tesla Inc.", price: 458.96, change: 2.42 },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 218.94,
      change: 1.15,
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      price: 612.34,
      change: 1.87,
    },
  ],
  index: [
    {
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      price: 285.32,
      change: 0.45,
    },
    {
      symbol: "IXUS",
      name: "iShares Core MSCI Total Intl Stk",
      price: 72.45,
      change: 0.32,
    },
    {
      symbol: "ILTB",
      name: "iShares Core 10+ Year USD Bond",
      price: 45.67,
      change: -0.12,
    },
    {
      symbol: "VOO",
      name: "Vanguard S&P 500 ETF",
      price: 542.18,
      change: 0.58,
    },
  ],
  quality: [
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 435.67,
      change: 0.78,
    },
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      price: 156.89,
      change: 0.34,
    },
    { symbol: "V", name: "Visa Inc.", price: 298.45, change: 1.12 },
    {
      symbol: "PG",
      name: "Procter & Gamble Co.",
      price: 168.92,
      change: 0.45,
    },
  ],
  value: [
    {
      symbol: "BRK-B",
      name: "Berkshire Hathaway Inc.",
      price: 478.23,
      change: 0.89,
    },
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      price: 245.67,
      change: 1.23,
    },
    {
      symbol: "BAC",
      name: "Bank of America Corp.",
      price: 42.18,
      change: 0.67,
    },
    { symbol: "WMT", name: "Walmart Inc.", price: 92.45, change: 0.34 },
  ],
};

const strategyIdToName: Record<string, string> = {
  ethical: "Ethical Investing",
  growth: "Growth Investing",
  index: "Index Investing",
  quality: "Quality Investing",
  value: "Value Investing",
};

type BackendPortfolioStock = {
  allocation?: number;
  allocation_percentage?: number;
  price?: number | string | null;
  shares?: number;
  value?: number;
  graph?: string | null;
  dates?: string[];
  prices?: (number | null)[];
  change?: number;
};

type BackendStrategyResult = {
  strategy: string;
  portfolio: Record<string, BackendPortfolioStock>;
  total_value?: number;
};

export type BackendPortfolioResponse = {
  results?: BackendStrategyResult[];
  overall_total_value?: number;
  error?: string;
  weekly_trend?: { day: string; value: number }[];
};

type AllocationOptions = {
  splitStrategiesEqually?: boolean;
  splitStocksEqually?: boolean;
};

export async function fetchPortfolio(
  amount: number,
  strategies: string[],
  options: AllocationOptions = {},
) {
  const backendStrategies = strategies.map((id) => strategyIdToName[id] ?? id);
  const splitStrategiesEqually = options.splitStrategiesEqually ?? true;
  const splitStocksEqually = options.splitStocksEqually ?? true;

  const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      investment: amount,
      strategies: backendStrategies,
      split_equally: splitStocksEqually,
      split_strategy: splitStrategiesEqually,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.statusText}`);
  }

  const data: BackendPortfolioResponse = await response.json();
  return transformBackendPortfolio(data, amount, backendStrategies);
}

export async function fetchMarketTicker(): Promise<
  { symbol: string; price: number; change: number }[]
> {
  const response = await fetch(`${API_BASE_URL}/api/market-ticker`);
  if (!response.ok) {
    throw new Error(`Market ticker fetch failed: ${response.statusText}`);
  }
  const data = await response.json();
  const market = data.market_ticker || data;

  return Object.entries(market).map(([symbol, info]) => {
    const tickerInfo = info as { price?: number; change?: number };
    return {
      symbol,
      price: Math.round(Number(tickerInfo.price ?? 0) * 100) / 100,
      change: Math.round(Number(tickerInfo.change ?? 0) * 100) / 100,
    };
  });
}

export async function refreshPortfolioPrices(
  holdings: { symbol: string; shares: number; price?: number }[],
): Promise<
  { symbol: string; price: number; change: number; value: number; stale?: boolean }[]
> {
  const response = await fetch(`${API_BASE_URL}/api/refresh-prices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ holdings }),
  });
  if (!response.ok) throw new Error(`Refresh failed: ${response.statusText}`);
  const data = await response.json();
  return data.holdings as {
    symbol: string;
    price: number;
    change: number;
    value: number;
    stale?: boolean;
  }[];
}

export function generateMockPortfolio(
  amount: number,
  strategies: string[],
  options: AllocationOptions = {},
) {
  const selectedStocks: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    allocation: number;
    allocationAmount: number;
    shares: number;
    value: number;
    strategy: string;
  }[] = [];

  const stocksPerStrategy = 3;
  const allStocks: {
    stock: (typeof strategyStocks.ethical)[0];
    strategy: string;
  }[] = [];

  strategies.forEach((s) => {
    const stocks = strategyStocks[s] || [];
    stocks.slice(0, stocksPerStrategy).forEach((stock) => {
      allStocks.push({ stock, strategy: s });
    });
  });

  const splitStrategiesEqually = options.splitStrategiesEqually ?? true;
  const splitStocksEqually = options.splitStocksEqually ?? true;

  // Strategy-level allocation
  const strategyWeights = strategies.map(() => Math.random());
  const strategyWeightSum = strategyWeights.reduce((a, b) => a + b, 0) || 1;
  const perStrategyAmount = strategies.map(
    (_, idx) =>
      Math.round(
        (splitStrategiesEqually
          ? amount / strategies.length
          : (strategyWeights[idx] / strategyWeightSum) * amount) * 100,
      ) / 100,
  );

  // Stock-level allocation within each strategy
  strategies.forEach((s, strategyIdx) => {
    const stocks = strategyStocks[s] || [];
    const perStrategyStocks = stocks.slice(0, stocksPerStrategy);

    const stockWeights = perStrategyStocks.map(() => Math.random());
    const stockWeightSum = stockWeights.reduce((a, b) => a + b, 0) || 1;

    perStrategyStocks.forEach((stock, stockIdx) => {
      const allocation =
        Math.round(
          (splitStocksEqually
            ? perStrategyAmount[strategyIdx] / perStrategyStocks.length
            : (stockWeights[stockIdx] / stockWeightSum) *
              perStrategyAmount[strategyIdx]) * 100,
        ) / 100;
      const shares = Math.round((allocation / stock.price) * 100) / 100;
      const value = Math.round(shares * stock.price * 100) / 100;
      selectedStocks.push({
        ...stock,
        allocation: Math.round((value / amount) * 100),
        allocationAmount: value,
        shares,
        value,
        strategy: strategyIdToName[s] ?? s,
      });
    });
  });

  const baseValue = amount;
  // Generate proper date labels for the last 5 days
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (4 - i));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });
  const weeklyTrend = days.map((day, index) => {
    const variance = (Math.random() - 0.4) * 0.02;
    const cumulativeChange = 1 + variance * (index + 1);
    return {
      day,
      value: Math.round(baseValue * cumulativeChange * 100) / 100,
    };
  });

  const totalValue =
    Math.round(weeklyTrend[weeklyTrend.length - 1].value * 100) / 100;
  const totalChange = calculatePercentChange(totalValue, amount);

  return {
    stocks: selectedStocks,
    weeklyTrend,
    totalValue,
    totalChange,
    strategies: strategies.map((s) => strategyIdToName[s] ?? s),
  };
}

export const generatePortfolio = generateMockPortfolio;

// Comprehensive name map covering all backend strategy stocks + common market symbols
const STOCK_NAME_MAP: Record<string, string> = {
  // Ethical Investing
  AAPL: "Apple Inc.",
  ADBE: "Adobe Inc.",
  NSRGY: "Nestlé S.A.",
  CRM: "Salesforce Inc.",
  // Growth Investing
  AMZN: "Amazon.com Inc.",
  TSLA: "Tesla Inc.",
  GOOGL: "Alphabet Inc.",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms Inc.",
  // Index Investing
  VTI: "Vanguard Total Stock Market ETF",
  IXUS: "iShares Core MSCI Total Intl Stk",
  ILTB: "iShares Core 10+ Year USD Bond",
  VOO: "Vanguard S&P 500 ETF",
  // Quality Investing
  MSFT: "Microsoft Corporation",
  JNJ: "Johnson & Johnson",
  PG: "Procter & Gamble Co.",
  V: "Visa Inc.",
  // Value Investing
  "BRK-B": "Berkshire Hathaway Inc.",
  KO: "Coca-Cola Co.",
  XOM: "Exxon Mobil Corporation",
  JPM: "JPMorgan Chase & Co.",
  BAC: "Bank of America Corp.",
  WMT: "Walmart Inc.",
  // Other market stocks
  NFLX: "Netflix Inc.",
  DIS: "The Walt Disney Co.",
  CSCO: "Cisco Systems Inc.",
  PEP: "PepsiCo Inc.",
  COST: "Costco Wholesale Corp.",
  MA: "Mastercard Inc.",
  HD: "The Home Depot Inc.",
  PYPL: "PayPal Holdings Inc.",
  INTC: "Intel Corporation",
  QCOM: "Qualcomm Inc.",
  T: "AT&T Inc.",
  NKE: "Nike Inc.",
  MCD: "McDonald's Corp.",
};

function getStockName(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (STOCK_NAME_MAP[upper]) return STOCK_NAME_MAP[upper];
  // Fall back to scanning strategyStocks (handles any future additions)
  const allStocks = Object.values(strategyStocks).flat();
  const match = allStocks.find(
    (stock) =>
      stock.symbol.replace(".", "").toUpperCase() ===
      upper.replace(".", ""),
  );
  return match?.name ?? symbol;
}

function parsePlotlyTrend(
  graphJson: string | null | undefined,
): { day: string; price: number }[] | null {
  if (!graphJson) return null;
  try {
    const parsed = JSON.parse(graphJson);
    const trace = parsed?.data?.[0];
    if (!trace?.x || !trace?.y) return null;

    // Build array of prices (may contain null/invalid values)
    const prices = trace.y.map((p: any) =>
      p != null && !isNaN(p) && p > 0 ? Number(p) : null,
    );

    // Back-fill
    for (let i = prices.length - 2; i >= 0; i--) {
      if (
        prices[i] === null &&
        i < prices.length - 1 &&
        prices[i + 1] !== null
      ) {
        prices[i] = prices[i + 1];
      }
    }

    // Forward-fill
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] === null && prices[i - 1] !== null) {
        prices[i] = prices[i - 1];
      }
    }

    const trend: { day: string; price: number }[] = [];
    for (let idx = 0; idx < trace.x.length; idx++) {
      if (prices[idx] !== null) {
        trend.push({
          day: formatDayLabel(trace.x[idx]),
          price: Math.round(prices[idx]! * 100) / 100,
        });
      }
    }

    return trend.length > 0 ? trend : null;
  } catch (error) {
    console.error("Failed to parse Plotly graph", error);
    return null;
  }
}

function buildStockTrend(
  stock: BackendPortfolioStock,
  fallbackPrice: number,
): { day: string; price: number }[] {
  const fromPlotly = parsePlotlyTrend(stock.graph);
  if (fromPlotly && fromPlotly.length) return fromPlotly;

  if (
    stock.dates &&
    stock.prices &&
    stock.dates.length === stock.prices.length
  ) {
    const prices = stock.prices.map((p) =>
      p != null && !isNaN(Number(p)) && Number(p) > 0 ? Number(p) : null,
    );

    // Back-fill
    for (let i = prices.length - 2; i >= 0; i--) {
      if (
        prices[i] === null &&
        i < prices.length - 1 &&
        prices[i + 1] !== null
      ) {
        prices[i] = prices[i + 1];
      }
    }

    // Forward-fill
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] === null && prices[i - 1] !== null) {
        prices[i] = prices[i - 1];
      }
    }

    for (let i = 0; i < prices.length; i++) {
      if (prices[i] === null) {
        prices[i] = fallbackPrice;
      }
    }

    const trend: { day: string; price: number }[] = [];
    for (let idx = 0; idx < stock.dates.length; idx++) {
      trend.push({
        day: formatDayLabel(stock.dates[idx]),
        price: Math.round(prices[idx]! * 100) / 100,
      });
    }

    return trend;
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  let price = fallbackPrice || 100;
  return days.map((day) => {
    price += (Math.random() - 0.4) * (fallbackPrice || 100) * 0.02;
    return {
      day,
      price:
        Math.round(Math.max(price, (fallbackPrice || 100) * 0.9) * 100) / 100,
    };
  });
}

function combinePortfolioTrend(
  stocks: { shares: number; weeklyTrend: { day: string; price: number }[] }[],
) {
  if (!stocks.length) return [];
  const maxPoints = Math.max(...stocks.map((s) => s.weeklyTrend.length));
  const dayLabels =
    stocks
      .find((s) => s.weeklyTrend.length === maxPoints)
      ?.weeklyTrend.map((p) => p.day) ?? [];

  const trend = dayLabels.map((day, idx) => {
    const value = stocks.reduce((sum, stock) => {
      const point = stock.weeklyTrend[idx];
      if (!point) return sum;
      return sum + point.price * stock.shares;
    }, 0);
    return { day, value: Math.round(value * 100) / 100 };
  });

  for (let i = 1; i < trend.length; i++) {
    if (trend[i].value === 0 && i > 0) {
      trend[i].value = trend[i - 1].value;
    }
  }

  return trend;
}

function formatDayLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function transformBackendPortfolio(
  data: BackendPortfolioResponse,
  amount: number,
  backendStrategies: string[],
) {
  if (data.error) {
    throw new Error(data.error);
  }

  const stocks = (data.results ?? []).flatMap((strategyResult) => {
    return Object.entries(strategyResult.portfolio || {}).map(
      ([symbol, stock]) => {
        const price = Math.round(Number(stock.price ?? 0) * 100) / 100;

        const allocationAmount =
          Math.round(
            (typeof stock.allocation === "number"
              ? stock.allocation
              : (stock.allocation_percentage ?? 0) * amount) * 100,
          ) / 100;

        const shares =
          Math.round(
            (typeof stock.shares === "number"
              ? stock.shares
              : price > 0
                ? allocationAmount / price
                : 0) * 100,
          ) / 100;

        const backendValue = Number(stock.value);
        const value =
          Math.round(
            (Number.isFinite(backendValue) && backendValue > 0
              ? backendValue
              : price > 0
                ? shares * price
                : allocationAmount) * 100,
          ) / 100;

        // ✅ Use backend allocation_percentage (predefined ratios within strategy)
        // If it's missing, fall back to share of total portfolio.
        const allocationRatio =
          typeof stock.allocation_percentage === "number"
            ? stock.allocation_percentage
            : value > 0
              ? value / amount
              : 0;

        return {
          symbol,
          name: getStockName(symbol),
          price,
          shares,
          allocation: Math.round(allocationRatio * 100), // e.g. 34, 33, 33
          allocationAmount,
          value,
          change: Math.round(Number(stock.change ?? 0) * 100) / 100,
          weeklyTrend: buildStockTrend(stock, price),
          strategy: strategyResult.strategy,
        };
      },
    );
  });

  const weeklyTrend =
    data.weekly_trend && data.weekly_trend.length
      ? data.weekly_trend.map((t) => ({
          ...t,
          value: Math.round(t.value * 100) / 100,
        }))
      : combinePortfolioTrend(stocks);

  const fallbackTotal =
    Math.round(
      stocks.reduce((sum, stock) => sum + (stock.value ?? 0), 0) * 100,
    ) / 100;

  const totalValue =
    Math.round(
      (data.overall_total_value && data.overall_total_value > 0
        ? data.overall_total_value
        : weeklyTrend.length
          ? weeklyTrend[weeklyTrend.length - 1].value
          : fallbackTotal) * 100,
    ) / 100;

  // Compare current portfolio value against the amount invested.
  // This is the most meaningful metric: positive = portfolio is worth MORE than invested,
  // negative = portfolio is worth LESS. (Mock portfolio already uses this formula.)
  const totalChange = calculatePercentChange(totalValue, amount);

  return {
    stocks,
    weeklyTrend,
    totalValue,
    totalChange,
    strategies: backendStrategies,
  };
}
