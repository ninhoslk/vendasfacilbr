import React, { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Receipt, FileBarChart,
  LogOut, Menu, X, Sun, Moon, Heart
} from "lucide-react";

const links = [
  { to: "/", label: "Venda Rápida", icon: ShoppingCart },
  { to: "/visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/catalogo", label: "Catálogo", icon: Package },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/doacao", label: "Apoiar Projeto", icon: Heart },
];

export default function AppLayout() {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          {/* SUA IMAGEM NO LUGAR DO RAIO */}
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
          <span className="text-lg font-bold text-foreground">VendaFácil</span>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t pt-4">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
          <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/80 backdrop-blur-xl px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold">VendaFácil</span>
          </div>
          <button onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </header>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-x-0 top-14 z-20 border-b bg-card p-4 lg:hidden shadow-lg">
              <nav className="space-y-1">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <l.icon className="h-5 w-5" /> {l.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto p-4"><Outlet /></main>
      </div>
    </div>
  );
}
