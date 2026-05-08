import { useState } from "react";
import { RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StockTicker from "@/components/StockTicker";
import InvestmentForm from "@/components/InvestmentForm";
import PortfolioResults from "@/components/PortfolioResults";
import MarketOverview from "@/components/MarketOverview";
import DashboardKPI from "@/components/DashboardKPI";
import Recommendations from "@/components/Recommendations";
import { fetchPortfolio, generateMockPortfolio } from "@/lib/portfolioData";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [portfolio, setPortfolio] = useState<{
    amount: number;
    stocks: any[];
    weeklyTrend: any[];
    totalValue: number;
    totalChange: number;
    strategies: string[];
  } | null>(null);

  const handleSubmit = async (
    amount: number,
    strategies: string[],
    splitStrategiesEqually: boolean,
    splitStocksEqually: boolean,
  ) => {
    setIsLoading(true);

    try {
      const result = await fetchPortfolio(amount, strategies, {
        splitStrategiesEqually,
        splitStocksEqually,
      });
      setPortfolio({
        amount,
        ...result,
      });
      setCurrentSection("dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Using sample data",
        description:
          "Live backend is unavailable. Showing simulated portfolio instead.",
      });
      const fallback = generateMockPortfolio(amount, strategies, {
        splitStrategiesEqually,
        splitStocksEqually,
      });
      setPortfolio({
        amount,
        ...fallback,
      });
      setCurrentSection("dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPortfolio(null);
    setCurrentSection("portfolio");
  };

  return (
    <Layout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {/* Header with Gradient */}
      <div className="relative mb-12 overflow-hidden rounded-2xl glass-card-subtle p-8 md:p-12 border-white/5">
        {/* Background gradients */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 fade-in-up">
                Welcome to{" "}
                <span className="gradient-text">Portfolio Engine</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl fade-in-up stagger-1">
                AI-powered investment strategies tailored to your financial
                goals
              </p>
            </div>
            {portfolio && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Portfolio
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stock Ticker */}
      {!portfolio && <StockTicker />}

      {/* Dashboard View */}
      {currentSection === "dashboard" && portfolio && (
        <div className="space-y-8 fade-in-up">
          {/* KPI Summary */}
          <DashboardKPI
            portfolioValue={portfolio.totalValue}
            dailyGain={portfolio.totalChange}
            riskScore={65}
            isLoading={isLoading}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Results */}
            <div className="lg:col-span-2 fade-in-up stagger-2">
              <PortfolioResults
                amount={portfolio.amount}
                strategies={portfolio.strategies}
                stocks={portfolio.stocks}
                weeklyTrend={portfolio.weeklyTrend}
                totalValue={portfolio.totalValue}
                totalChange={portfolio.totalChange}
              />
            </div>

            {/* Market Overview */}
            <div className="fade-in-up stagger-3">
              <MarketOverview />
            </div>
          </div>

          {/* Recommendations */}
          <div className="fade-in-up stagger-4">
            <Recommendations
              onAddStock={(symbol) => {
                toast({
                  title: "Stock Added",
                  description: `${symbol} has been added to your watchlist.`,
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Portfolio Builder View */}
      {currentSection === "portfolio" && (
        <div className="space-y-8">
          {portfolio ? (
            <div className="space-y-8 fade-in-up">
              <DashboardKPI
                portfolioValue={portfolio.totalValue}
                dailyGain={portfolio.totalChange}
                riskScore={65}
                isLoading={isLoading}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <PortfolioResults
                    amount={portfolio.amount}
                    strategies={portfolio.strategies}
                    stocks={portfolio.stocks}
                    weeklyTrend={portfolio.weeklyTrend}
                    totalValue={portfolio.totalValue}
                    totalChange={portfolio.totalChange}
                  />
                </div>
                <div>
                  <MarketOverview />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Investment Form */}
              <div className="lg:col-span-2 fade-in-up">
                <div className="premium-card">
                  <InvestmentForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Market Overview */}
              <div className="fade-in-up stagger-1">
                <MarketOverview />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {currentSection === "analytics" && (
        <div className="space-y-8">
          <div className="premium-card text-center py-12 fade-in-up">
            <TrendingUp className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Market Analytics
            </h2>
            <p className="text-muted-foreground">
              Advanced market analysis and insights coming soon
            </p>
          </div>

          {portfolio && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <MarketOverview />
              </div>
              <div>
                <div className="premium-card">
                  <h3 className="font-semibold text-foreground mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Return</p>
                      <p className="text-xl font-bold text-primary">
                        +{portfolio.totalChange.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Portfolio Value</p>
                      <p className="text-xl font-bold text-foreground">
                        ${portfolio.totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!portfolio && currentSection === "dashboard" && (
        <div className="premium-card text-center py-20 fade-in-up">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No Portfolio Yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first portfolio by selecting investment strategies and
            an amount to get started.
          </p>
          <Button
            onClick={() => setCurrentSection("portfolio")}
            className="premium-button-primary"
          >
            Create Portfolio
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Index;
