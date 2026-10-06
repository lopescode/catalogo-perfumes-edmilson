"use client";

import { useState } from "react";
import { RESELLER_NAME, STORES, whatsappLink } from "@/config";
import type { ProductSummary } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { WhatsApp } from "./Icons";
import { QtyStepper } from "./QtyStepper";

export function BuyActions({ product }: { product: ProductSummary }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const question = `Olá, ${RESELLER_NAME.split(" ")[0]}! Tenho uma dúvida sobre o ${product.name} (${STORES[product.store].label} · cód. ${product.sku}).`;

  if (product.stock === "unavailable") {
    const notify = `Olá, ${RESELLER_NAME.split(" ")[0]}! O ${product.name} (cód. ${product.sku}) está esgotado no site. Pode me avisar quando chegar?`;
    return (
      <div className="space-y-3">
        <p className="flex h-14 items-center justify-center rounded-full bg-soft font-semibold text-muted">
          Esgotado no momento
        </p>
        <a
          href={whatsappLink(notify)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] text-sm font-semibold text-white transition hover:brightness-105"
        >
          <WhatsApp className="size-4" /> Avise-me quando chegar
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {product.stock === "critical" && (
        <p className="flex items-center gap-2 text-sm font-semibold text-[#b7791f]">
          <span className="size-2 animate-pulse rounded-full bg-[#e9a23b]" /> Últimas unidades disponíveis
        </p>
      )}
      <div className="flex items-center gap-4">
        <QtyStepper value={qty} onChange={setQty} />
        <button
          onClick={() => add(product, qty)}
          className="h-14 flex-1 rounded-full bg-linear-to-r from-accent to-wine px-4 text-base font-semibold text-white shadow-lg shadow-accent/30 transition hover:brightness-110 sm:text-lg"
        >
          <span className="sm:hidden">Adicionar</span>
          <span className="hidden sm:inline">Adicionar à sacola</span>
        </button>
      </div>
      <a
        href={whatsappLink(question)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#25d366]/40 text-sm font-medium text-[#128c4a] transition hover:bg-[#25d366]/10"
      >
        <WhatsApp className="size-4" /> Tirar dúvida no WhatsApp
      </a>
    </div>
  );
}
