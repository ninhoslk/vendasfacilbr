import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
  CatalogItem, Sale, Expense, Category,
  mockCatalogItems, mockSales, mockExpenses, mockCategories,
} from "@/data/mockData";

interface DataContextType {
  catalogItems: CatalogItem[];
  sales: Sale[];
  expenses: Expense[];
  categories: Category[];
  addCatalogItem: (item: Omit<CatalogItem, "id" | "userId">) => void;
  updateCatalogItem: (id: string, item: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;
  addSale: (sale: Omit<Sale, "id" | "userId">) => void;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id" | "userId">) => void;
  deleteExpense: (id: string) => void;
  addCategory: (cat: Omit<Category, "id" | "userId">) => void;
  deleteCategory: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

let idCounter = 100;
const genId = () => `local-${++idCounter}`;

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isMock } = useAuth();
  const uid = user?.uid || "mock-user";

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(isMock ? mockCatalogItems : []);
  const [sales, setSales] = useState<Sale[]>(isMock ? mockSales : []);
  const [expenses, setExpenses] = useState<Expense[]>(isMock ? mockExpenses : []);
  const [categories, setCategories] = useState<Category[]>(isMock ? mockCategories : []);

  const addCatalogItem = useCallback((item: Omit<CatalogItem, "id" | "userId">) => {
    setCatalogItems((prev) => [...prev, { ...item, id: genId(), userId: uid }]);
  }, [uid]);

  const updateCatalogItem = useCallback((id: string, updates: Partial<CatalogItem>) => {
    setCatalogItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const deleteCatalogItem = useCallback((id: string) => {
    setCatalogItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addSale = useCallback((sale: Omit<Sale, "id" | "userId">) => {
    setSales((prev) => [...prev, { ...sale, id: genId(), userId: uid }]);
  }, [uid]);

  const deleteSale = useCallback((id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, "id" | "userId">) => {
    setExpenses((prev) => [...prev, { ...expense, id: genId(), userId: uid }]);
  }, [uid]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addCategory = useCallback((cat: Omit<Category, "id" | "userId">) => {
    setCategories((prev) => [...prev, { ...cat, id: genId(), userId: uid }]);
  }, [uid]);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      catalogItems, sales, expenses, categories,
      addCatalogItem, updateCatalogItem, deleteCatalogItem,
      addSale, deleteSale, addExpense, deleteExpense,
      addCategory, deleteCategory,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
