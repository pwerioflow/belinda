import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/login";
import WelcomePage from "@/pages/welcome";
import MenuPage from "@/pages/menu";
import MusicPage from "@/pages/music";
import ColoringPage from "@/pages/coloring";
import PhotosPage from "@/pages/photos";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const { data: userResponse, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const isAuthenticated = !!(userResponse as any)?.user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={LoginPage} />
      ) : (
        <>
          <Route path="/" component={WelcomePage} />
          <Route path="/menu" component={MenuPage} />
          <Route path="/music" component={MusicPage} />
          <Route path="/coloring" component={ColoringPage} />
          <Route path="/photos" component={PhotosPage} />
          <Route path="/settings" component={SettingsPage} />
        </>
      )}
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
