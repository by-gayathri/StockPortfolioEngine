import { useEffect, useRef, useState } from "react";
import { BarChart2 } from "lucide-react";

const MarketOverview = () => {
  const [dateRange, setDateRange] = useState<
    "1D" | "1W" | "1M" | "3M" | "6M" | "12M" | "60M"
  >("12M");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing widget scripts (helps with React strict mode double-mount)
    container.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;

    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange,
      showChart: true,
      locale: "en",
      width: "100%",
      height: 420,
      isTransparent: true,
      showSymbolLogo: true,
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "NASDAQ 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "INDEX:DEU40", d: "DAX" },
            { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
            { s: "INDEX:NKY", d: "Nikkei 225" },
          ],
        },
        {
          title: "Commodities",
          symbols: [
            { s: "TVC:GOLD", d: "Gold" },
            { s: "TVC:SILVER", d: "Silver" },
            { s: "TVC:USOIL", d: "Crude Oil" },
            // More robust symbols for gas & dollar index:
            { s: "INDEX:DXY", d: "US Dollar Index" },
          ],
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
            { s: "FX:USDCHF", d: "USD/CHF" },
            { s: "FX:AUDUSD", d: "AUD/USD" },
            { s: "FX:USDCAD", d: "USD/CAD" },
          ],
        },
      ],
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [dateRange]);

  return (
    <div className="premium-card fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Market Overview</h2>
          <p className="text-xs text-muted-foreground">Real-time data</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["1D", "1W", "1M", "3M", "6M", "12M", "60M"] as const).map(
          (range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dateRange === range
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-white/5"
              }`}
            >
              {range}
            </button>
          ),
        )}
      </div>

      <div
        className="tv-widget-wrapper rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]"
        style={{ minHeight: 460 }}
      >
        <div
          className="tradingview-widget-container"
          ref={containerRef}
          style={{ height: "440px" }}
        >
          <div
            className="tradingview-widget-container__widget"
            style={{ height: "440px" }}
          />
          <div className="tradingview-widget-copyright text-xs text-muted-foreground text-center py-2">
            <a
              href="https://www.tradingview.com/markets/"
              rel="noopener noreferrer"
              target="_blank"
              className="underline-offset-2 hover:underline text-muted-foreground/60 hover:text-muted-foreground"
            >
              Markets by TradingView
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
