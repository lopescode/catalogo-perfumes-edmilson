"use client";

import Image from "next/image";
import type { ProductSummary } from "@/lib/types";

export function CartToast({ product, onOpen }: { product: ProductSummary | null; onOpen: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition duration-300 ${
        product ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {product && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-2 text-white shadow-2xl">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-white">
            <Image src={product.image} alt="" fill sizes="44px" className="object-contain p-1" />
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <span className="block font-semibold">Adicionado à sacola</span>
            <span className="block truncate text-white/70">{product.name}</span>
          </span>
          <button
            onClick={onOpen}
            className="shrink-0 rounded-full bg-linear-to-r from-accent to-wine px-4 py-2.5 text-sm font-semibold"
          >
            Ver sacola
          </button>
        </div>
      )}
    </div>
  );
}
