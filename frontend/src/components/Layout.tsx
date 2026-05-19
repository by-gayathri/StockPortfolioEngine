import { useState } from "react";
import {
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Home,
  Settings,
  LifeBuoy,
  User,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  ExternalLink,
  BookOpen,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  userName?: string;
  onChangeName?: (name: string) => void;
  onClearHistory?: () => void;
  historyCount?: number;
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What is the minimum investment amount?",
    a: "The minimum investment is $5,000. This limit is enforced by both the frontend form and the backend API. There is no maximum limit.",
  },
  {
    q: "Where does the stock price data come from?",
    a: "All prices are fetched live from Yahoo Finance via the yfinance Python library. If the market is closed, the most recent closing price is shown.",
  },
  {
    q: "Why is my portfolio value slightly below what I invested?",
    a: "Share quantities are rounded to 2 decimal places (e.g., 9.12 shares). This means the exact dollar allocation can't always be matched perfectly — the difference is typically just a few cents and reflects real-world fractional share rounding.",
  },
  {
    q: "How many strategies can I select?",
    a: "You can select up to 2 strategies per portfolio. When 2 are chosen, you can split the investment equally (50/50) or randomly.",
  },
  {
    q: "Is my portfolio history saved if I refresh the page?",
    a: "Yes! Your last 10 portfolios are automatically saved to your browser's local storage and will be available even after a page refresh.",
  },
  {
    q: "How do I export my portfolio?",
    a: "Click the 'Download PDF' button in the portfolio results section. A formatted PDF with all holdings, allocation details, and a weekly performance table will download automatically.",
  },
  {
    q: "Can I use this app without the backend running?",
    a: "If the backend is unavailable, the app falls back to simulated data with randomised prices so you can still explore the UI. A toast notification will inform you when this happens.",
  },
];

// ─── Settings Panel ───────────────────────────────────────────────────────────

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onChangeName: (name: string) => void;
  onClearHistory: () => void;
  historyCount: number;
}

const SettingsPanel = ({
  open,
  onClose,
  userName,
  onChangeName,
  onClearHistory,
  historyCount,
}: SettingsPanelProps) => {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      onChangeName(trimmed);
      setEditingName(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[360px] bg-[hsl(217,33%,10%)] border-white/10 overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <SheetTitle className="text-foreground text-lg font-bold">
              Settings
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="space-y-8 pt-6">
          {/* ── Profile ──────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Your Profile
            </h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex gap-2">
                      <Input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setEditingName(false);
                        }}
                        className="h-8 text-sm bg-white/5 border-white/10"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={handleSaveName}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {userName || "Investor"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Portfolio Engine User
                      </p>
                    </>
                  )}
                </div>
                {!editingName && (
                  <button
                    onClick={() => {
                      setNameInput(userName);
                      setEditingName(true);
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── Portfolio Data ────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Portfolio Data
            </h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Saved Portfolios
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {historyCount} of 10 slots used
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {historyCount}
                </span>
              </div>

              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{ width: `${Math.min(historyCount / 10, 1) * 100}%` }}
                />
              </div>

              {historyCount > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors mt-1">
                      <Trash2 className="w-3 h-3" />
                      Clear all saved portfolios
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[hsl(217,33%,10%)] border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        Clear Portfolio History?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete all {historyCount} saved
                        portfolios from your browser. Your current active
                        portfolio will not be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 text-foreground hover:bg-white/5">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onClearHistory();
                          onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </section>

          {/* ── About ────────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              About
            </h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
              {[
                { label: "Course", value: "CMPE-285" },
                { label: "University", value: "San José State University" },
                { label: "Data Source", value: "Yahoo Finance (yfinance)" },
                { label: "Version", value: "1.0.0" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="text-foreground text-xs font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ─── Support Panel ────────────────────────────────────────────────────────────

interface SupportPanelProps {
  open: boolean;
  onClose: () => void;
}

const SupportPanel = ({ open, onClose }: SupportPanelProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleSendFeedback = () => {
    if (!feedback.trim()) return;
    const subject = encodeURIComponent("Portfolio Engine Feedback");
    const body = encodeURIComponent(feedback.trim());
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    setFeedback("");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[380px] bg-[hsl(217,33%,10%)] border-white/10 overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-emerald-400" />
            </div>
            <SheetTitle className="text-foreground text-lg font-bold">
              Support &amp; Help
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="space-y-8 pt-6">
          {/* ── Quick Start ──────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Quick Start Guide
            </h3>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Set Your Investment",
                  desc: "Enter an amount of $5,000 or more in the Portfolio Builder.",
                },
                {
                  step: "2",
                  title: "Choose Strategies",
                  desc: "Pick 1 or 2 strategies — Ethical, Growth, Index, Quality, or Value.",
                },
                {
                  step: "3",
                  title: "Generate & Explore",
                  desc: "View your live portfolio, analytics, and export a PDF report.",
                },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="border border-white/5 rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.02] transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm text-foreground font-medium pr-2">
                      {item.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-white/5 pt-2">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Feedback ─────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Send Feedback
            </h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Found a bug or have a suggestion? Let us know.
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe your feedback or issue..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
              />
              <Button
                onClick={handleSendFeedback}
                disabled={!feedback.trim()}
                size="sm"
                className="w-full gap-2 premium-button-primary"
              >
                <Mail className="w-3.5 h-3.5" />
                Send via Email
              </Button>
            </div>
          </section>

          {/* ── Links ────────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Resources
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Yahoo Finance",
                  href: "https://finance.yahoo.com",
                  desc: "Live stock prices",
                },
                {
                  label: "yfinance Docs",
                  href: "https://pypi.org/project/yfinance/",
                  desc: "Python data library",
                },
                {
                  label: "TradingView",
                  href: "https://www.tradingview.com/markets/",
                  desc: "Market charts",
                },
              ].map(({ label, href, desc }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-white/[0.02] transition-all group"
                >
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ─── Layout ───────────────────────────────────────────────────────────────────

const Layout = ({
  children,
  currentSection = "dashboard",
  onSectionChange,
  userName = "",
  onChangeName,
  onClearHistory,
  historyCount = 0,
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview & KPIs",
    },
    {
      id: "portfolio",
      label: "Portfolio Builder",
      icon: TrendingUp,
      description: "Create strategy",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Market insights",
    },
  ];

  const displayName = userName || "Investor";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`glass-card-subtle fixed left-0 top-0 h-full border-r border-white/10 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } z-50 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  Portfolio
                </span>
                <span className="text-xs text-muted-foreground">Engine</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* User identity strip */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">Portfolio Engine</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange?.(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`fade-in-up w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
                    isActive
                      ? "bg-primary/20 border border-primary/50 text-primary"
                      : "text-muted-foreground hover:bg-white/5 border border-transparent"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && (
                    <div className="text-left">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs opacity-60">
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer — Support & Settings */}
        <div className="border-t border-white/5 p-3 space-y-2">
          <button
            onClick={() => setSupportOpen(true)}
            className="w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all flex items-center gap-3"
          >
            <LifeBuoy className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Support</span>
            )}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all flex items-center gap-3"
          >
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        <div className="min-h-screen p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-8 right-8 lg:hidden h-12 w-12 rounded-full glass-card-subtle"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Settings & Support sheets */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={displayName}
        onChangeName={(name) => {
          onChangeName?.(name);
        }}
        onClearHistory={() => {
          onClearHistory?.();
        }}
        historyCount={historyCount}
      />

      <SupportPanel
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </div>
  );
};

export default Layout;
