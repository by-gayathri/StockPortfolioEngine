import { useState } from "react";
import { DollarSign, ArrowRight, Sparkles, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StrategyCard from "./StrategyCard";
import { toast } from "@/hooks/use-toast";

interface Strategy {
  id: string;
  name: string;
  description: string;
  icon: "ethical" | "growth" | "index" | "quality" | "value";
}

const strategies: Strategy[] = [
  {
    id: "ethical",
    name: "Ethical Investing",
    description:
      "Invest in companies with strong ESG practices. Focus on sustainability and social responsibility.",
    icon: "ethical",
  },
  {
    id: "growth",
    name: "Growth Investing",
    description:
      "Target high-growth companies with potential for significant capital appreciation.",
    icon: "growth",
  },
  {
    id: "index",
    name: "Index Investing",
    description:
      "Track market indexes for diversified, low-cost exposure to broad markets.",
    icon: "index",
  },
  {
    id: "quality",
    name: "Quality Investing",
    description:
      "Focus on companies with strong fundamentals, stable earnings, and competitive advantages.",
    icon: "quality",
  },
  {
    id: "value",
    name: "Value Investing",
    description:
      "Find undervalued stocks trading below their intrinsic value for long-term gains.",
    icon: "value",
  },
];

interface InvestmentFormProps {
  onSubmit: (
    amount: number,
    selectedStrategies: string[],
    splitStrategiesEqually: boolean,
    splitStocksEqually: boolean,
  ) => void;
  isLoading?: boolean;
}

const InvestmentForm = ({
  onSubmit,
  isLoading = false,
}: InvestmentFormProps) => {
  const [amount, setAmount] = useState<string>("");
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [splitStrategiesEqually, setSplitStrategiesEqually] =
    useState<boolean>(true);
  const [splitStocksEqually, setSplitStocksEqually] = useState<boolean>(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleStrategyToggle = (id: string) => {
    setSelectedStrategies((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 2) {
        toast({
          title: "Strategy Limit Reached",
          description: "You can select a maximum of 2 strategies.",
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 5000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a minimum investment of $5,000.",
        variant: "destructive",
      });
      return;
    }

    if (selectedStrategies.length === 0) {
      toast({
        title: "No Strategy Selected",
        description: "Please select at least one investment strategy.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(
      numAmount,
      selectedStrategies,
      splitStrategiesEqually,
      splitStocksEqually,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8 fade-in-up">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 flex-1">
            <div className={`step-number ${step >= s ? "completed" : ""}`}>
              {s}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {s === 1 && "Investment"}
              {s === 2 && "Strategy"}
              {s === 3 && "Allocation"}
            </div>
            {s < 3 && (
              <div
                className={`h-1 flex-1 rounded-full mx-2 transition-all ${
                  step > s ? "bg-primary" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Investment Amount */}
      {step === 1 && (
        <div className="premium-card fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                How much do you want to invest?
              </h2>
              <p className="text-sm text-muted-foreground">
                Minimum investment is $5,000 USD
              </p>
            </div>
          </div>

          <div className="mt-8">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
                $
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  setAmount(value);
                }}
                placeholder="10,000"
                className="premium-input pl-12 h-16 text-3xl font-bold"
              />
            </div>
            {amount && (
              <p className="text-sm text-primary mt-3 font-medium">
                ✓ Valid amount: ${parseFloat(amount || "0").toLocaleString()}
              </p>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              onClick={() => {
                const numAmount = parseFloat(amount);
                if (isNaN(numAmount) || numAmount < 5000) {
                  toast({
                    title: "Invalid Amount",
                    description: "Please enter a minimum investment of $5,000.",
                    variant: "destructive",
                  });
                  return;
                }
                setStep(2);
              }}
              className="flex-1 premium-button-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Strategy Selection */}
      {step === 2 && (
        <div className="fade-in-up">
          <div className="premium-card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-bg bg-gradient-to-br from-accent/30 to-accent/10">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Choose Your Strategies
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select 1 or 2 investment strategies
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {strategies.map((strategy, index) => (
              <div
                key={strategy.id}
                className="fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <StrategyCard
                  id={strategy.id}
                  name={strategy.name}
                  description={strategy.description}
                  icon={strategy.icon}
                  selected={selectedStrategies.includes(strategy.id)}
                  onToggle={handleStrategyToggle}
                  disabled={
                    selectedStrategies.length >= 2 &&
                    !selectedStrategies.includes(strategy.id)
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedStrategies.length === 0) {
                  toast({
                    title: "No Strategy Selected",
                    description:
                      "Please select at least one investment strategy.",
                    variant: "destructive",
                  });
                  return;
                }
                setStep(3);
              }}
              className="flex-1 premium-button-primary"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Allocation Settings */}
      {step === 3 && (
        <div className="fade-in-up space-y-6">
          {/* Strategy Split */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Distribute Investment
                </h3>
                <p className="text-sm text-muted-foreground">
                  How to split among selected strategies
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitStrategiesEqually(true)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  splitStrategiesEqually
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-foreground hover:border-primary/50"
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitStrategiesEqually(false)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  !splitStrategiesEqually
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-foreground hover:border-primary/50"
                }`}
              >
                Random Split
              </button>
            </div>
          </div>

          {/* Stock Allocation */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-bg bg-gradient-to-br from-accent/30 to-accent/10">
                <Settings2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Stock Allocation Method
                </h3>
                <p className="text-sm text-muted-foreground">
                  How to allocate stocks within strategies
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitStocksEqually(true)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  splitStocksEqually
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-foreground hover:border-primary/50"
                }`}
              >
                Predefined
              </button>
              <button
                type="button"
                onClick={() => setSplitStocksEqually(false)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  !splitStocksEqually
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-foreground hover:border-primary/50"
                }`}
              >
                Random
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card-subtle p-6 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-sm text-foreground mb-2">
              <span className="font-semibold">Investment:</span> $
              {parseFloat(amount || "0").toLocaleString()}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-semibold">Strategies:</span>{" "}
              {selectedStrategies
                .map((s) => strategies.find((st) => st.id === s)?.name)
                .join(", ")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 premium-button-primary"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Generate Portfolio
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default InvestmentForm;
