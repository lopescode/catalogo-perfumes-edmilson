"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { CartSheet } from "./CartSheet";
import { CartToast } from "./CartToast";

export type CartItem = { product: ProductSummary; qty: number };

const KEY = "sacola-v1";
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;
const EMPTY: CartItem[] = [];

function read(): CartItem[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // armazenamento indisponível: a sacola vale só para esta visita
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const keyOf = (p: Pick<ProductSummary, "store" | "sku">) => `${p.store}:${p.sku}`;

/**
 * Atualiza os itens da sacola (preço, estoque) com o catálogo mais recente.
 * A sacola guarda uma cópia do produto de quando ele foi adicionado.
 */
export function syncCart(products: ProductSummary[]) {
  const current = read();
  if (!current.length) return;
  const fresh = new Map(products.map((p) => [keyOf(p), p]));
  let changed = false;
  const next = current.map((item) => {
    const p = fresh.get(keyOf(item.product));
    if (!p || JSON.stringify(p) === JSON.stringify(item.product)) return item;
    changed = true;
    return { ...item, product: p };
  });
  if (changed) write(next);
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  /** `openSheet: false` mostra só um aviso rápido em vez de abrir a sacola. */
  add: (product: ProductSummary, qty?: number, openSheet?: boolean) => void;
  setQty: (product: ProductSummary, qty: number) => void;
  remove: (product: ProductSummary) => void;
  clear: () => void;
  open: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<ProductSummary | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const orderable = items.filter((i) => i.product.stock !== "unavailable");
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = orderable.reduce((n, i) => n + i.product.salePrice * i.qty, 0);

  const setQty = useCallback((product: ProductSummary, qty: number) => {
    const k = keyOf(product);
    const current = read();
    if (qty <= 0) return write(current.filter((i) => keyOf(i.product) !== k));
    const exists = current.some((i) => keyOf(i.product) === k);
    write(
      exists
        ? current.map((i) => (keyOf(i.product) === k ? { ...i, qty } : i))
        : [...current, { product, qty }],
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      setQty,
      add: (product, qty = 1, openSheet = true) => {
        const existing = read().find((i) => keyOf(i.product) === keyOf(product));
        setQty(product, (existing?.qty ?? 0) + qty);
        if (openSheet) return setOpen(true);
        clearTimeout(toastTimer.current);
        setToast(product);
        toastTimer.current = setTimeout(() => setToast(null), 2800);
      },
      remove: (product) => setQty(product, 0),
      clear: () => write([]),
      open: () => setOpen(true),
    }),
    [items, count, setQty],
  );

  return (
    <CartContext value={value}>
      {children}
      <CartToast
        product={toast}
        onOpen={() => {
          setToast(null);
          setOpen(true);
        }}
      />
      {count > 0 && !toast && !isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-white shadow-2xl transition hover:scale-[1.02]"
        >
          <span className="text-sm">
            <span className="font-semibold">{count} {count === 1 ? "item" : "itens"}</span>
            <span className="text-white/70"> · {formatPrice(total)}</span>
          </span>
          <span className="rounded-full bg-linear-to-r from-accent to-wine px-4 py-2 text-sm font-semibold">Ver sacola</span>
        </button>
      )}
      <CartSheet open={isOpen} onClose={() => setOpen(false)} />
    </CartContext>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
