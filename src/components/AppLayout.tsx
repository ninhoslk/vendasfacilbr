import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Receipt, FileBarChart,
  LogOut, Menu, X, Sun, Moon, Heart, Settings as SettingsIcon, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Busca a cor personalizada do usuário e aplica no CSS
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().themeColor) {
          document.documentElement.style.setProperty('--primary', snap.data().themeColor);
        }
      }
    };
    loadTheme();
  }, [user]);

  const links = [
    { to: "/", label: "Venda Rápida", icon: ShoppingCart },
    { to: "/visao-geral", label: "Visão Geral", icon: LayoutDashboard },
    { to: "/catalogo", label: "Catálogo", icon: Package },
    { to: "/vendas", label: "Vendas", icon: ShoppingCart },
    { to: "/despesas", label: "Despesas", icon: Receipt },
    { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
    { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
    { to: "/doacao", label: "Apoiar Projeto", icon: Heart },
  ];

  if (user?.email === 'brenoalves18110@gmail.com') {
    links.push({ to: "/admin", label: "Painel Admin", icon: ShieldCheck });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="p-2 bg-primary/10 rounded-lg">
             <FileBarChart className="text-primary" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">VendaFácil</span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <l.icon size={20} /> {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t">
          <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </Button>
          <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start gap-3 text-destructive font-medium">
            <LogOut size={18} /> Sair
          </Button>
        </div>
      </aside>

      {/* Layout Mobile e Main */}
      <div className="flex flex-1 flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <FileBarChart className="text-primary" size={24} />
            <span className="font-bold text-primary text-xl tracking-tight">VendaFácil</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </header>
        
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="lg:hidden bg-card border-b overflow-hidden px-4 py-2">
               {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 text-sm font-medium text-muted-foreground">
                  <l.icon size={18}/> {l.label}
                </NavLink>
               ))}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
