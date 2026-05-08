import { useState } from "react";
import {
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Home,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const Layout = ({
  children,
  currentSection = "dashboard",
  onSectionChange,
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

        {/* Footer */}
        <div className="border-t border-white/5 p-3 space-y-2">
          <button className="w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 transition-all flex items-center gap-3">
            <LifeBuoy className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Support</span>}
          </button>
          <button className="w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 transition-all flex items-center gap-3">
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
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
    </div>
  );
};

export default Layout;
