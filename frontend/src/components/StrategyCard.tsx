import {
  Check,
  Leaf,
  TrendingUp,
  BarChart3,
  Award,
  DollarSign,
} from "lucide-react";

interface StrategyCardProps {
  id: string;
  name: string;
  description: string;
  icon: "ethical" | "growth" | "index" | "quality" | "value";
  selected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

const iconMap = {
  ethical: Leaf,
  growth: TrendingUp,
  index: BarChart3,
  quality: Award,
  value: DollarSign,
};

const colorMap = {
  ethical: "from-emerald-500 to-teal-600",
  growth: "from-blue-500 to-indigo-600",
  index: "from-violet-500 to-purple-600",
  quality: "from-amber-500 to-orange-600",
  value: "from-rose-500 to-pink-600",
};

const StrategyCard = ({
  id,
  name,
  description,
  icon,
  selected,
  onToggle,
  disabled = false,
}: StrategyCardProps) => {
  const Icon = iconMap[icon];

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled}
      className={`strategy-card text-left w-full group transition-all duration-300 ${
        selected ? "selected" : ""
      } ${disabled && !selected ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[icon]} flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-${icon}-500/20`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground text-base">{name}</h3>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                selected
                  ? "border-primary bg-primary"
                  : "border-white/20 group-hover:border-primary/50"
              }`}
            >
              {selected && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default StrategyCard;
