import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import NavigationTabs from "@/components/NavigationTabs";
import Landing from "@/pages/Landing";
import Connect from "@/pages/Connect";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Analytics from "@/pages/Analytics";
import ForecastReport from "@/pages/ForecastReport";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDarkMode = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState("connect");
  const [, setLocation] = useLocation();

  const handleReturnHome = () => {
    setLocation("/");
  };

  const handleConnected = () => {
    setActiveTab("dashboard");
  };

  const renderPage = () => {
    switch (activeTab) {
      case "connect":
        return <Connect onConnected={handleConnected} />;
      case "dashboard":
        return <Dashboard />;
      case "orders":
        return <Orders />;
      case "analytics":
        return <Analytics />;
      case "forecastreport":
        return <ForecastReport />;
      case "settings":
        return <Settings />;
      default:
        return <Connect onConnected={handleConnected} />;
    }
  };

  return (
    <DashboardProvider>
      <div className="relative">
        {/* Header with Home Button */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Xtock</h1>
            <p className="text-sm text-muted-foreground">AI Produce Ordering</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturnHome}
            data-testid="button-return-home"
          >
            Home
          </Button>
        </header>
        {renderPage()}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </DashboardProvider>
  );
}

function Router() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/app");
  };

  return (
    <Switch>
      <Route path="/" component={() => <Landing onGetStarted={handleGetStarted} />} />
      <Route path="/app" component={MainApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
