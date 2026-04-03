import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import QuickSale from "@/pages/QuickSale";
import Dashboard from "@/pages/Dashboard";
import Catalog from "@/pages/Catalog";
import Sales from "@/pages/Sales";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import Doacao from "@/pages/Doacao";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<QuickSale />} />
                <Route path="/visao-geral" element={<Dashboard />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/vendas" element={<Sales />} />
                <Route path="/despesas" element={<Expenses />} />
                <Route path="/relatorios" element={<Reports />} />
                <Route path="/doacao" element={<Doacao />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
