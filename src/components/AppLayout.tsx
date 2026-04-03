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

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [userThemeColor, setUserThemeColor] = useState("#8b5cf6");
  const location = useLocation();

  // Links do Menu
  const links = [
    { to: "/", label: "Venda Rápida", icon: ShoppingCart },
    { to: "/visao-geral", label: "Visão Geral", icon: LayoutDashboard },
    { to: "/catalogo", label: "Catálogo", icon: Package },
    { to: "/vendas", label: "Vendas", icon: ShoppingCart },
    { to: "/despesas", label: "Despesas", icon: Receipt },
    { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
    { to: "/configuracoes", label: "Configurações", icon: SettingsIcon }, // NOVO
    { to: "/doacao", label: "Apoiar Projeto", icon: Heart },
  ];

  // Adiciona link de Admin se for você
  if (user?.email === 'brenoalves18110@gmail.com') {
    links.push({ to: "/admin", label: "Painel Admin", icon: ShieldCheck });
  }

  // Carrega a cor personalizada do usuário
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().themeColor) {
          const color = snap.data().themeColor;
          setUserThemeColor(color);
          document.documentElement.style.setProperty('--primary', color);
        }
      }
    };
    loadUserTheme();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="p-2 bg-primary/10 rounded-lg">
             <ShoppingCart className="text-primary" size={24} />
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
                  isActive ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <l.icon size={20} /> {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
          <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header Mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/80 backdrop-blur-xl px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">VendaFácil</span>
          </div>
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg bg-muted">
            {open ? <X /> : <Menu />}
          </button>
        </header>

        {/* Menu Mobile Animate */}
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }} 
              className="border-b bg-card px-4 py-4 lg:hidden shadow-xl"
            >
              <nav className="space-y-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    <l.icon size={20} /> {l.label}
                  </NavLink>
                ))}
                <button onClick={() => {signOut(); setOpen(false);}} className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-destructive">
                  <LogOut size={20} /> Sair
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
