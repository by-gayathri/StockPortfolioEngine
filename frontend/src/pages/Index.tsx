import { useState, useEffect } from "react";
import {
  RotateCcw,
  TrendingUp,
  TrendingDown,
  History,
  Plus,
  ArrowLeft,
  Clock,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StockTicker from "@/components/StockTicker";
import InvestmentForm from "@/components/InvestmentForm";
import PortfolioResults from "@/components/PortfolioResults";
import MarketOverview from "@/components/MarketOverview";
import DashboardKPI from "@/components/DashboardKPI";
import Recommendations from "@/components/Recommendations";
import PortfolioAnalytics from "@/components/PortfolioAnalytics";
import WelcomeModal from "@/components/WelcomeModal";
import { fetchPortfolio, generateMockPortfolio } from "@/lib/portfolioData";
import { toast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type PortfolioEntry = {
  amount: number;
  stocks: any[];
  weeklyTrend: any[];
  totalValue: number;
  totalChange: number;
  strategies: string[];
  createdAt: string; // ISO timestamp
};

const MAX_HISTORY = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState("dashboard");

  // ── Identity ─────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("portfolioUserName") || "";
  });
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !localStorage.getItem("portfolioUserName");
  });

  // Active portfolio — restored from localStorage on load
  const [portfolio, setPortfolio] = useState<PortfolioEntry | null>(() => {
    try {
      const saved = localStorage.getItem("currentPortfolio");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Ring buffer of previous portfolios (newest first, max 5) — persisted in localStorage
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioEntry[]>(() => {
    try {
      const saved = localStorage.getItem("portfolioHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Whether the "Create Portfolio" form is shown in the portfolio section
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ── Persist history to localStorage on every change ───────────────────────
  useEffect(() => {
    localStorage.setItem("portfolioHistory", JSON.stringify(portfolioHistory));
  }, [portfolioHistory]);

  // ── Persist current portfolio to localStorage on change ──────────────────
  useEffect(() => {
    if (portfolio) {
      localStorage.setItem("currentPortfolio", JSON.stringify(portfolio));
    }
  }, [portfolio]);

  // ── Identity helpers ──────────────────────────────────────────────────────
  const handleSetUserName = (name: string) => {
    const trimmed = name.trim() || "Investor";
    localStorage.setItem("portfolioUserName", trimmed);
    setUserName(trimmed);
    setShowWelcome(false);
  };

  const handleChangeName = (name: string) => {
    const trimmed = name.trim() || "Investor";
    localStorage.setItem("portfolioUserName", trimmed);
    setUserName(trimmed);
  };

  const handleClearHistory = () => {
    setPortfolioHistory([]);
    localStorage.removeItem("portfolioHistory");
    toast({
      title: "History Cleared",
      description: "All saved portfolios have been removed.",
    });
  };

  // ── Submit handler ──────────────────────────────────────────────────────

  const handleSubmit = async (
    amount: number,
    strategies: string[],
    splitStrategiesEqually: boolean,
    splitStocksEqually: boolean,
  ) => {
    setIsLoading(true);

    const applyPortfolio = (result: Omit<PortfolioEntry, "amount" | "createdAt">) => {
      const entry: PortfolioEntry = {
        amount,
        ...result,
        createdAt: new Date().toISOString(),
      };

      // Push current portfolio into history before replacing (if one exists)
      if (portfolio) {
        setPortfolioHistory((prev) => [portfolio, ...prev].slice(0, MAX_HISTORY));
      }

      setPortfolio(entry);
      setShowCreateForm(false);
      setCurrentSection("dashboard");
    };

    try {
      const result = await fetchPortfolio(amount, strategies, {
        splitStrategiesEqually,
        splitStocksEqually,
      });
      applyPortfolio(result);
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
      applyPortfolio(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Navigation helpers ──────────────────────────────────────────────────

  /** Open the creation form WITHOUT destroying the current portfolio */
  const handleNewPortfolio = () => {
    setShowCreateForm(true);
    setCurrentSection("portfolio");
  };

  /** Cancel form — go back to dashboard (current portfolio still intact) */
  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCurrentSection(portfolio ? "dashboard" : "dashboard");
  };

  /** Swap a history entry into the active slot */
  const handleLoadHistory = (idx: number) => {
    const entry = portfolioHistory[idx];
    if (!entry) return;

    setPortfolioHistory((prev) => {
      const withoutLoaded = prev.filter((_, i) => i !== idx);
      if (!portfolio) return withoutLoaded;
      return [portfolio, ...withoutLoaded].slice(0, MAX_HISTORY);
    });

    setPortfolio(entry);
    setShowCreateForm(false);
    setCurrentSection("dashboard");

    toast({
      title: "Portfolio Loaded",
      description: `Viewing ${entry.strategies.join(" + ")} — ${formatTimestamp(entry.createdAt)}`,
    });
  };

  /** Delete a history entry */
  const handleDeleteHistory = (idx: number) => {
    setPortfolioHistory((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Derived ─────────────────────────────────────────────────────────────

  const isPortfolioSection = currentSection === "portfolio";
  const showForm = isPortfolioSection && (showCreateForm || !portfolio);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
    {showWelcome && <WelcomeModal onComplete={handleSetUserName} />}
    <Layout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      userName={userName}
      onChangeName={handleChangeName}
      onClearHistory={handleClearHistory}
      historyCount={portfolioHistory.length}
    >

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative mb-12 overflow-hidden rounded-2xl glass-card-subtle p-8 md:p-12 border-white/5">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 fade-in-up">
                {userName ? `Welcome, ${userName.split(" ")[0]}` : "Welcome to"}{" "}
                <span className="gradient-text">
                  {userName ? "Portfolio Engine" : "Portfolio Engine"}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl fade-in-up stagger-1">
                AI-powered investment strategies tailored to your financial goals
              </p>
            </div>

            {/* Action buttons shown when a portfolio exists */}
            {portfolio && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {portfolioHistory.length > 0 && (
                  <Button
                    onClick={() => {
                      setShowCreateForm(false);
                      setCurrentSection("portfolio");
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2 hidden md:flex"
                  >
                    <History className="w-4 h-4" />
                    History ({portfolioHistory.length})
                  </Button>
                )}
                <Button
                  onClick={handleNewPortfolio}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Portfolio
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Ticker — only on empty dashboard */}
      {!portfolio && currentSection === "dashboard" && <StockTicker />}

      {/* ── Dashboard Section ────────────────────────────────────────────── */}
      {currentSection === "dashboard" && portfolio && (
        <div className="space-y-8 fade-in-up">
          <DashboardKPI
            portfolioValue={portfolio.totalValue}
            investedAmount={portfolio.amount}
            dailyGain={portfolio.totalChange}
            riskScore={65}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="fade-in-up stagger-3">
              <MarketOverview />
            </div>
          </div>

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

      {/* ── Portfolio Section ────────────────────────────────────────────── */}
      {currentSection === "portfolio" && (
        <div className="space-y-8">
          {showForm ? (
            /* ── Create Form + History Panel ───────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-4 fade-in-up">
                {/* Back button when a portfolio already exists */}
                {portfolio && (
                  <button
                    onClick={handleCancelCreate}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to current portfolio
                  </button>
                )}
                <div className="premium-card">
                  <InvestmentForm onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
              </div>

              {/* Sidebar: History or Market Overview */}
              <div className="fade-in-up stagger-1 space-y-4">
                {portfolioHistory.length > 0 ? (
                  <PortfolioHistoryPanel
                    history={portfolioHistory}
                    onLoad={handleLoadHistory}
                    onDelete={handleDeleteHistory}
                    formatTimestamp={formatTimestamp}
                  />
                ) : (
                  <MarketOverview />
                )}
              </div>
            </div>
          ) : (
            /* ── Portfolio Results + History Panel ─────────────────────── */
            <div className="space-y-8 fade-in-up">
              {portfolio ? (
                <>
                  {/* "Create new" banner */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Viewing your active portfolio
                    </p>
                    <Button onClick={handleNewPortfolio} size="sm" className="gap-2 premium-button-primary">
                      <Plus className="w-4 h-4" />
                      Create New Portfolio
                    </Button>
                  </div>

                  <DashboardKPI
                    portfolioValue={portfolio.totalValue}
                    investedAmount={portfolio.amount}
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
                        userName={userName}
                      />
                    </div>
                    <div className="space-y-4">
                      {portfolioHistory.length > 0 && (
                        <PortfolioHistoryPanel
                          history={portfolioHistory}
                          onLoad={handleLoadHistory}
                          onDelete={handleDeleteHistory}
                          formatTimestamp={formatTimestamp}
                        />
                      )}
                      <MarketOverview />
                    </div>
                  </div>
                </>
              ) : (
                /* No portfolio yet — go straight to the form */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 fade-in-up">
                    <div className="premium-card">
                      <InvestmentForm onSubmit={handleSubmit} isLoading={isLoading} />
                    </div>
                  </div>
                  <div className="fade-in-up stagger-1">
                    <MarketOverview />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Analytics Section ────────────────────────────────────────────── */}
      {currentSection === "analytics" && (
        <div className="space-y-8">
          {portfolio ? (
            <>
              {/* Section header */}
              <div className="flex items-center gap-3">
                <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
                  <BarChart2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Market Analytics</h2>
                  <p className="text-sm text-muted-foreground">
                    Deep-dive into your portfolio — allocation breakdown, performance table, movers &amp; market heatmap
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Analytics main content (3/4 width) */}
                <div className="lg:col-span-3">
                  <PortfolioAnalytics portfolio={portfolio} />
                </div>

                {/* Sidebar: history + market overview (1/4 width) */}
                <div className="space-y-6">
                  {portfolioHistory.length > 0 && (
                    <PortfolioHistoryPanel
                      history={portfolioHistory}
                      onLoad={handleLoadHistory}
                      onDelete={handleDeleteHistory}
                      formatTimestamp={formatTimestamp}
                    />
                  )}
                  <MarketOverview />
                </div>
              </div>
            </>
          ) : (
            /* No portfolio yet — prompt user */
            <div className="premium-card text-center py-20 fade-in-up">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <BarChart2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No Portfolio to Analyze
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create a portfolio first — then this tab will show allocation charts,
                holdings detail, best/worst movers, and a live market heatmap.
              </p>
              <button
                onClick={() => setCurrentSection("portfolio")}
                className="premium-button-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
              >
                Create Portfolio
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Empty Dashboard State ────────────────────────────────────────── */}
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
    </>
  );
};

// ─── Portfolio History Panel ──────────────────────────────────────────────────

interface HistoryPanelProps {
  history: PortfolioEntry[];
  onLoad: (idx: number) => void;
  onDelete: (idx: number) => void;
  formatTimestamp: (iso: string) => string;
}

const PortfolioHistoryPanel = ({
  history,
  onLoad,
  onDelete,
  formatTimestamp,
}: HistoryPanelProps) => {
  return (
    <div className="premium-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
          <History className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Portfolio History
          </h3>
          <p className="text-xs text-muted-foreground">
            {history.length} saved {history.length === 1 ? "portfolio" : "portfolios"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((entry, idx) => {
          const isUp = entry.totalValue >= entry.amount;
          return (
            <div
              key={`${entry.createdAt}-${idx}`}
              className="glass-card-subtle rounded-xl p-3 border border-white/5 hover:border-primary/30 transition-colors group"
            >
              {/* Strategy name + timestamp */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {entry.strategies.join(" + ")}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">
                      {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>
                </div>
                {/* Delete button */}
                <button
                  onClick={() => onDelete(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 ml-2 flex-shrink-0"
                  title="Remove from history"
                >
                  ×
                </button>
              </div>

              {/* Value + change row */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    ${entry.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invested: ${entry.amount.toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {isUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {entry.totalValue > entry.amount ? "+" : entry.totalValue < entry.amount ? "-" : ""}
                    {Math.abs(entry.totalChange).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Load button */}
              <Button
                onClick={() => onLoad(idx)}
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Load Portfolio
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
