import { Sparkles, TrendingUp, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Recommendation {
  symbol: string;
  name: string;
  reason: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  targetPrice: number;
  currentPrice: number;
}

const mockRecommendations: Recommendation[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    reason:
      "Strong growth trajectory with consistent earnings. Excellent for growth-focused portfolios.",
    confidence: 92,
    riskLevel: "low",
    targetPrice: 185.5,
    currentPrice: 175.2,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    reason:
      "AI leadership position. Premium valuation justified by market dominance.",
    confidence: 88,
    riskLevel: "low",
    targetPrice: 410.0,
    currentPrice: 390.5,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    reason:
      "EV market leader. Consider for growth strategies with higher risk tolerance.",
    confidence: 75,
    riskLevel: "high",
    targetPrice: 320.0,
    currentPrice: 245.8,
  },
];

interface RecommendationsProps {
  recommendations?: Recommendation[];
  onAddStock?: (symbol: string) => void;
}

const Recommendations = ({
  recommendations: propRecommendations,
  onAddStock,
}: RecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    propRecommendations || mockRecommendations,
  );
  const [loading, setLoading] = useState(!propRecommendations);

  useEffect(() => {
    if (propRecommendations) {
      setRecommendations(propRecommendations);
      return;
    }

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

    let isMounted = true;

    fetch(`${API_BASE_URL}/api/recommendations`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.recommendations?.length) {
          setRecommendations(data.recommendations);
        }
      })
      .catch((error) => {
        console.warn("Failed to fetch recommendations, using mock data", error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propRecommendations]);
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-emerald-400";
      case "medium":
        return "text-amber-400";
      case "high":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getConfidenceGradient = (confidence: number) => {
    if (confidence >= 85) return "from-green-500 to-emerald-500";
    if (confidence >= 70) return "from-yellow-500 to-amber-500";
    return "from-orange-500 to-red-500";
  };

  return (
    <div className="fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            AI-Generated Suggestions
          </h2>
        </div>
        <p className="text-muted-foreground">
          Personalized stock recommendations based on your portfolio strategy
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.symbol}
            className="premium-card group hover:shadow-lg hover:shadow-primary/10 fade-in-up"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {rec.symbol[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {rec.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {rec.symbol}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-bold text-foreground">
                  ${rec.currentPrice.toFixed(2)}
                </p>
                <p className="text-sm text-emerald-400">
                  → ${rec.targetPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {rec.reason}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Confidence Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Confidence
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {rec.confidence}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getConfidenceGradient(rec.confidence)}`}
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
              </div>

              {/* Risk Level */}
              <div className="flex items-end gap-2">
                <AlertCircle
                  className={`w-4 h-4 ${getRiskColor(rec.riskLevel)}`}
                />
                <span
                  className={`text-sm font-medium ${getRiskColor(rec.riskLevel)}`}
                >
                  {rec.riskLevel.charAt(0).toUpperCase() +
                    rec.riskLevel.slice(1)}{" "}
                  Risk
                </span>
              </div>

              {/* Upside Potential */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    +
                    {((rec.targetPrice / rec.currentPrice - 1) * 100).toFixed(
                      1,
                    )}
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Upside</p>
              </div>
            </div>

            <Button
              onClick={() => onAddStock?.(rec.symbol)}
              className="w-full premium-button-primary text-sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Add to Portfolio
            </Button>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-6 premium-card text-center fade-in-up">
        <Shield className="w-8 h-8 text-primary/60 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          ✓ AI-powered analysis • ✓ Risk-adjusted • ✓ Strategy-aligned
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
