import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  colorName: string;
  price: number;
  image: string;
  size: string;
  qty: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, size: string, qty: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
}

const sameLine = (a: CartItem, id: string, size: string) =>
  a.id === id && a.size === size;

const safeMax = (n: number) => (Number.isFinite(n) && n > 0 ? n : 99);

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const max = safeMax(item.maxStock);
          const existing = s.items.find((i) =>
            sameLine(i, item.id, item.size),
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                sameLine(i, item.id, item.size)
                  ? { ...i, maxStock: max, qty: Math.min(i.qty + qty, max) }
                  : i,
              ),
            };
          }
          return {
            items: [...s.items, { ...item, maxStock: max, qty: Math.min(qty, max) }],
          };
        }),
      setQty: (id, size, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            sameLine(i, id, size)
              ? { ...i, qty: Math.max(1, Math.min(qty, safeMax(i.maxStock))) }
              : i,
          ),
        })),
      remove: (id, size) =>
        set((s) => ({
          items: s.items.filter((i) => !sameLine(i, id, size)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "neva-cart",
      version: 2,
      // reset legacy carts that pre-date stock limits
      migrate: () => ({ items: [] }) as unknown as CartState,
    },
  ),
);

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty, 0);
