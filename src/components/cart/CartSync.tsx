"use client";

import { useEffect } from "react";
import type { ProductSummary } from "@/lib/types";
import { syncCart } from "./CartProvider";

/** Mantém a sacola em dia com os preços e o estoque do catálogo carregado na página. */
export function CartSync({ products }: { products: ProductSummary[] }) {
  useEffect(() => syncCart(products), [products]);
  return null;
}
