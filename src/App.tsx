import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import QuickSale from "@/pages/QuickSale";
import Catalog from "@/pages/Catalog";
import Sales from "@/pages/Sales";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings"; // Importe a nova página
import NotFound from "@/pages/NotFound";

const App = () => (
  <ThemeProvider>
    <Sonner position="top-right" />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<QuickSale />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/vendas" element={<Sales />} />
            <Route path="/despesas" element={<Expenses />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
