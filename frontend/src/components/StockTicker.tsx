import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fetchMarketTicker } from "@/lib/portfolioData";

interface StockData {
  symbol: string;
  price: number;
  change: number;
}

const mockStocks: StockData[] = [
  { symbol: "AAPL", price: 278.28, change: 0.48 },
  { symbol: "TSLA", price: 458.96, change: 10.87 },
  { symbol: "GOOGL", price: 175.42, change: -1.23 },
  { symbol: "MSFT", price: 435.67, change: 3.45 },
  { symbol: "AMZN", price: 218.94, change: 2.15 },
  { symbol: "VTI", price: 285.32, change: 1.28 },
  { symbol: "ADBE", price: 512.45, change: -2.34 },
  { symbol: "NVDA", price: 875.29, change: 5.12 },
];

const StockTicker = () => {
  const [stocks, setStocks] = useState<StockData[]>(mockStocks);

  useEffect(() => {
    let isMounted = true;

    fetchMarketTicker()
      .then((data) => {
        if (isMounted && data.length) {
          setStocks(data);
        }
      })
      .catch((error) => {
        console.warn("Falling back to mock ticker data", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const duplicatedStocks = [...stocks, ...stocks];

  return (
    <div className="w-full overflow-hidden glass-card-subtle border-y border-white/10 py-4 mb-8 fade-in-up">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="ticker-scroll flex gap-12 whitespace-nowrap px-8">
          {duplicatedStocks.map((stock, index) => (
            <div
              key={`${stock.symbol}-${index}`}
              className="flex items-center gap-4 flex-shrink-0 group cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-foreground text-sm">
                  {stock.symbol}
                </span>
                <span className="text-xs text-muted-foreground">
                  ${stock.price.toFixed(2)}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                  stock.change >= 0
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockTicker;
