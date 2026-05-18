import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, User, TrendingUp } from "lucide-react";

interface WelcomeModalProps {
  onComplete: (name: string) => void;
}

const WelcomeModal = ({ onComplete }: WelcomeModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    onComplete(trimmed || "Investor");
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md border border-white/10 bg-[hsl(217,33%,10%)]">
        <DialogHeader>
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Welcome to Portfolio Engine
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm pt-1">
            AI-powered investment strategies tailored to your financial goals
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: "📈", label: "5 Strategies" },
              { icon: "💰", label: "Live Prices" },
              { icon: "📊", label: "Analytics" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl bg-white/[0.03] border border-white/5 p-3"
              >
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-muted-foreground font-medium">
                  {f.label}
                </div>
              </div>
            ))}
          </div>

          {/* Name input */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              What should we call you?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Your name appears in the sidebar and on exported PDF reports.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full premium-button-primary gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Get Started
          </Button>

          <button
            onClick={() => onComplete("Investor")}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
          >
            Skip for now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
