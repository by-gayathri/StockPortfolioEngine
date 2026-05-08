import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  shares: number;
  allocation: number;
  value: number;
  weeklyTrend: { day: string; price: number }[];
}

const StockCard = ({
  symbol,
  name,
  price,
  shares,
  allocation,
  value,
  weeklyTrend,
}: StockCardProps) => {
  const priceChange =
    weeklyTrend.length > 1
      ? weeklyTrend[weeklyTrend.length - 1].price - weeklyTrend[0].price
      : 0;
  const isPositive = priceChange >= 0;

  // Calculate dynamic Y-axis domain - filter out any zero/null values
  const yAxisDomain = useMemo(() => {
    const validPrices = weeklyTrend
      .map((d) => d.price)
      .filter((p) => p != null && !isNaN(p) && p > 0);

    if (validPrices.length === 0) return ["auto", "auto"];

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);
    const range = maxPrice - minPrice;

    // Add 10% padding on each side for better visualization
    const padding = Math.max(range * 0.1, minPrice * 0.005);
    return [minPrice - padding, maxPrice + padding];
  }, [weeklyTrend]);

  return (
    <div className="premium-card group hover:shadow-lg hover:shadow-primary/5 fade-in-up flex flex-col">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://finance.yahoo.com/quote/${symbol}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors mb-2 group/link"
              >
                {symbol}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>View {symbol} on Yahoo Finance</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        <p className="text-sm text-muted-foreground">{name}</p>
      </div>

      {/* Key Metrics */}
      <div className="flex-1 py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Price
            </p>
            <p className="text-lg font-bold text-foreground">
              ${price.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Shares
            </p>
            <p className="text-lg font-bold text-foreground">
              {shares.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Allocation
            </p>
            <p className="text-lg font-bold text-primary">{allocation}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Value
            </p>
            <p className="text-lg font-bold text-foreground">
              ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/[0.02] rounded-lg p-3 mb-3">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <XAxis
                  dataKey="day"
                  stroke="hsl(215, 15%, 60%)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(215, 15%, 60%)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  domain={yAxisDomain}
                  tickCount={4}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(217, 33%, 8%)",
                    border: "1px solid hsl(217, 20%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Price",
                  ]}
                  labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={
                    isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"
                  }
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Change */}
        {priceChange !== 0 && (
          <div
            className={`flex items-center gap-2 text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)} this week
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
