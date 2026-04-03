export interface CatalogItem {
  id: string;
  name: string;
  defaultPrice: number;
  type: "product" | "expense";
  userId: string;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalValue: number;
  date: string;
  userId: string;
}

export interface Expense {
  id: string;
  description: string;
  itemId?: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  type: "expense" | "product";
  userId: string;
}

const uid = "mock-user";

export const mockCategories: Category[] = [
  { id: "cat1", name: "Ingredientes", type: "expense", userId: uid },
  { id: "cat2", name: "Embalagens", type: "expense", userId: uid },
  { id: "cat3", name: "Transporte", type: "expense", userId: uid },
  { id: "cat4", name: "Outros", type: "expense", userId: uid },
];

export const mockCatalogItems: CatalogItem[] = [
  { id: "p1", name: "Brigadeiro Gourmet", defaultPrice: 5, type: "product", userId: uid },
  { id: "p2", name: "Bolo de Pote", defaultPrice: 12, type: "product", userId: uid },
  { id: "p3", name: "Trufa", defaultPrice: 6, type: "product", userId: uid },
  { id: "p4", name: "Coxinha", defaultPrice: 7, type: "product", userId: uid },
  { id: "e1", name: "Leite Condensado", defaultPrice: 8.5, type: "expense", userId: uid },
  { id: "e2", name: "Chocolate em Pó", defaultPrice: 12, type: "expense", userId: uid },
  { id: "e3", name: "Caixas de Embalagem", defaultPrice: 25, type: "expense", userId: uid },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmt(d);
};

export const mockSales: Sale[] = [
  { id: "s1", itemId: "p1", itemName: "Brigadeiro Gourmet", quantity: 20, totalValue: 100, date: fmt(today), userId: uid },
  { id: "s2", itemId: "p2", itemName: "Bolo de Pote", quantity: 5, totalValue: 60, date: fmt(today), userId: uid },
  { id: "s3", itemId: "p3", itemName: "Trufa", quantity: 15, totalValue: 90, date: daysAgo(1), userId: uid },
  { id: "s4", itemId: "p1", itemName: "Brigadeiro Gourmet", quantity: 30, totalValue: 150, date: daysAgo(2), userId: uid },
  { id: "s5", itemId: "p4", itemName: "Coxinha", quantity: 10, totalValue: 70, date: daysAgo(3), userId: uid },
  { id: "s6", itemId: "p2", itemName: "Bolo de Pote", quantity: 8, totalValue: 96, date: daysAgo(5), userId: uid },
  { id: "s7", itemId: "p3", itemName: "Trufa", quantity: 12, totalValue: 72, date: daysAgo(7), userId: uid },
  { id: "s8", itemId: "p1", itemName: "Brigadeiro Gourmet", quantity: 25, totalValue: 125, date: daysAgo(10), userId: uid },
  { id: "s9", itemId: "p4", itemName: "Coxinha", quantity: 18, totalValue: 126, date: daysAgo(14), userId: uid },
  { id: "s10", itemId: "p2", itemName: "Bolo de Pote", quantity: 6, totalValue: 72, date: daysAgo(20), userId: uid },
];

export const mockExpenses: Expense[] = [
  { id: "x1", description: "Leite Condensado", itemId: "e1", amount: 42.5, categoryId: "cat1", categoryName: "Ingredientes", date: daysAgo(1), userId: uid },
  { id: "x2", description: "Chocolate em Pó", itemId: "e2", amount: 36, categoryId: "cat1", categoryName: "Ingredientes", date: daysAgo(2), userId: uid },
  { id: "x3", description: "Caixas de Embalagem", itemId: "e3", amount: 75, categoryId: "cat2", categoryName: "Embalagens", date: daysAgo(3), userId: uid },
  { id: "x4", description: "Uber para entrega", amount: 18, categoryId: "cat3", categoryName: "Transporte", date: daysAgo(4), userId: uid },
  { id: "x5", description: "Gás de Cozinha", amount: 110, categoryId: "cat4", categoryName: "Outros", date: daysAgo(6), userId: uid },
  { id: "x6", description: "Leite Condensado", itemId: "e1", amount: 34, categoryId: "cat1", categoryName: "Ingredientes", date: daysAgo(10), userId: uid },
  { id: "x7", description: "Embalagens descartáveis", amount: 45, categoryId: "cat2", categoryName: "Embalagens", date: daysAgo(15), userId: uid },
];
