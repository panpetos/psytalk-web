import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { authService } from "./lib/auth";
import { AuthUser } from "./types";

import Navigation from "./components/navigation";
import Landing from "./pages/landing";
import PsychologistSearch from "./pages/psychologist-search";
import Booking from "./pages/booking";
import ClientDashboard from "./pages/client-dashboard";
import PsychologistDashboard from "./pages/psychologist-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import VideoConsultation from "./pages/video-consultation";
import LoginModal from "./components/auth/login-modal";
import RegisterModal from "./components/auth/register-modal";
import NotFound from "@/pages/not-found";

function Router() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    return authService.onAuthChange(setUser);
  }, []);

  const handleShowLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleShowRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  return (
    <>
      <Navigation 
        user={user} 
        onShowLogin={handleShowLogin}
        onShowRegister={handleShowRegister}
      />
      
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/search" component={PsychologistSearch} />
        <Route path="/booking/:psychologistId" component={Booking} />
        <Route path="/consultation/:appointmentId" component={VideoConsultation} />
        
        {/* Protected routes based on user role */}
        {user?.role === 'client' && (
          <Route path="/dashboard" component={ClientDashboard} />
        )}
        {user?.role === 'psychologist' && (
          <Route path="/dashboard" component={PsychologistDashboard} />
        )}
        {user?.role === 'admin' && (
          <Route path="/admin" component={AdminDashboard} />
        )}
        
        <Route component={NotFound} />
      </Switch>

      <LoginModal 
        open={showLoginModal} 
        onClose={handleCloseModals}
        onShowRegister={handleShowRegister}
      />
      
      <RegisterModal 
        open={showRegisterModal} 
        onClose={handleCloseModals}
        onShowLogin={handleShowLogin}
      />
    </>
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
