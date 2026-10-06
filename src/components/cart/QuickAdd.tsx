"use client";

import type { ProductSummary } from "@/lib/types";
import { Bag, Plus } from "../Icons";
import { useCart } from "./CartProvider";

/** `className` deve definir o posicionamento (ex.: "absolute right-4 top-4"); o padrão é "relative". */
export function QuickAdd({ product, className = "relative" }: { product: ProductSummary; className?: string }) {
  const { items, add } = useCart();
  const qty = items.find((i) => i.product.store === product.store && i.product.sku === product.sku)?.qty ?? 0;

  return (
    <button
      type="button"
      onClick={() => add(product, 1, false)}
      aria-label={`Adicionar ${product.name} à sacola`}
      className={`z-10 grid size-10 place-items-center rounded-full bg-white text-ink shadow-md transition hover:scale-105 hover:bg-linear-to-br hover:from-accent hover:to-wine hover:text-white active:scale-95 ${className}`}
    >
      <Bag className="size-5" />
      <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-accent text-white">
        {qty > 0 ? <span className="text-[10px] font-bold leading-none">{qty}</span> : <Plus className="size-3" />}
      </span>
    </button>
  );
}
