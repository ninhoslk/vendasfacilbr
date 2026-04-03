import React, { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Zap, ShoppingCart, Receipt, FileBarChart,
  LogOut, Menu, X, Sun, Moon, Heart, ShieldAlert
} from "lucide-react";

const links = [
  { to: "/", label: "Venda Rápida", icon: Zap },
  { to: "/visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/catalogo", label: "Catálogo", icon: Package },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/doacao", label: "Apoiar Projeto", icon: Heart },
  { to: "/admin", label: "Painel Admin", icon: ShieldAlert },
];

export default function AppLayout() {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl stat-gradient-blue">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
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
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border pt-4">
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
          <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg stat-gradient-blue">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">VendaFácil</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-muted-foreground">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setOpen(!open)} className="p-2 text-foreground">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-x-0 top-14 z-20 border-b border-border bg-card p-4 lg:hidden shadow-lg"
            >
              <nav className="space-y-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      }`
                    }
                  >
                    <l.icon className="h-5 w-5" />
                    {l.label}
                  </NavLink>
                ))}
                <button onClick={() => { signOut(); setOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-6xl p-4 md:p-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
