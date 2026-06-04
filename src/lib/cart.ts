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
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
}

const sameLine = (a: CartItem, id: string, size: string) =>
  a.id === id && a.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) =>
            sameLine(i, item.id, item.size),
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                sameLine(i, item.id, item.size) ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      remove: (id, size) =>
        set((s) => ({
          items: s.items.filter((i) => !sameLine(i, id, size)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "neva-cart" },
  ),
);

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty, 0);
