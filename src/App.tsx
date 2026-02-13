import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard2 from "./pages/Dashboard2";
import Roteiros from "./pages/Roteiros";
import Decodificar from "./pages/Decodificar";
import Simulador from "./pages/Simulador";
import Videos from "./pages/Videos";
import Consultas from "./pages/Consultas";
import Instagram from "./pages/Instagram";
import Ranking from "./pages/Ranking";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import Funil from "./pages/Funil";
import IconReference from "./pages/IconReference";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard2" element={<Dashboard2 />} />
          <Route path="/roteiros" element={<Roteiros />} />
          <Route path="/decodificar" element={<Decodificar />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/funil" element={<Funil />} />
          <Route path="/icons" element={<IconReference />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/perfil" element={<Perfil />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
