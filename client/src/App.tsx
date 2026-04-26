import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import CheckIn from "@/pages/CheckIn";
import History from "@/pages/History";
import SRS from "@/pages/SRS";
import Reading from "@/pages/Reading";
import BottomNav from "@/components/BottomNav";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <div className="min-h-dvh bg-background grid-bg relative">
          {/* Ambient glow effects */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-1/3 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="pb-20 safe-bottom">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/checkin" component={CheckIn} />
              <Route path="/history" component={History} />
              <Route path="/srs" component={SRS} />
              <Route path="/reading" component={Reading} />
            </Switch>
          </div>

          <BottomNav />
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
