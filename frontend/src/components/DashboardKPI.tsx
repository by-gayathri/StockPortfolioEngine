import { TrendingUp, TrendingDown, Zap, AlertCircle } from "lucide-react";

interface KPIData {
  portfolioValue?: number;
  investedAmount?: number; // raw investment; used for sign correctness when % rounds to 0.00
  dailyGain?: number;
  riskScore?: number;
  isLoading?: boolean;
}

const DashboardKPI = ({
  portfolioValue,
  investedAmount,
  dailyGain,
  riskScore,
  isLoading,
}: KPIData) => {
  // Use direct dollar comparison so sub-cent rounding never flips the sign
  const isPositiveReturn =
    investedAmount != null && portfolioValue != null
      ? portfolioValue > investedAmount
      : dailyGain != null
        ? dailyGain > 0
        : true;
  const isNegativeReturn =
    investedAmount != null && portfolioValue != null
      ? portfolioValue < investedAmount
      : dailyGain != null
        ? dailyGain < 0
        : false;
  const gainSign = isPositiveReturn ? "+" : isNegativeReturn ? "-" : "";
  const kpis = [
    {
      label: "Portfolio Value",
      value: portfolioValue ? `$${portfolioValue.toLocaleString()}` : "$0",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    {
      label: "Total Return",
      value: dailyGain != null
        ? `${gainSign}${Math.abs(dailyGain).toFixed(2)}%`
        : "0.00%",
      icon: isNegativeReturn ? TrendingDown : TrendingUp,
      color: isNegativeReturn
        ? "from-red-500/20 to-pink-500/20"
        : "from-green-500/20 to-emerald-500/20",
      borderColor: isNegativeReturn ? "border-red-500/30" : "border-green-500/30",
      iconColor: isNegativeReturn ? "text-red-400" : "text-green-400",
    },
    {
      label: "Risk Score",
      value: riskScore !== undefined ? riskScore : "N/A",
      icon: AlertCircle,
      color: "from-orange-500/20 to-amber-500/20",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
    },
    {
      label: "Status",
      value: "Active",
      icon: Zap,
      color: "from-purple-500/20 to-indigo-500/20",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className={`kpi-card border ${kpi.borderColor} bg-gradient-to-br ${kpi.color} fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  {kpi.label}
                </p>
                {isLoading ? (
                  <div className="h-8 bg-white/5 rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                )}
              </div>
              <div className={`icon-bg bg-white/5 ${kpi.iconColor} rounded-lg`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardKPI;
