import type { Audience } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatPrice = (value: number) => brl.format(value);

export function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export const AUDIENCE_LABEL: Record<Audience, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  unissex: "Unissex",
  infantil: "Infantil",
  kits: "Kits e presentes",
};

const PRODUCT_TYPES = [
  "Spray Perfumado Desodorante Colônia",
  "Body Splash Desodorante Colônia",
  "Desodorante Colônia",
  "Eau de Parfum",
  "Eau de Toilette",
  "Body Splash",
  "Colônia",
  "Perfume",
];

/**
 * Separa o nome comercial do tipo de produto, para títulos curtos:
 * "Body Splash Desodorante Colônia Cuide-Se Bem Pessegura 60Ml"
 * → { title: "Cuide-Se Bem Pessegura", kind: "Body Splash Desodorante Colônia" }
 */
export function splitProductName(name: string) {
  let title = name.replace(/\s*\d+([.,]\d+)?\s*(ml|g)\b/gi, "").trim();
  let kind: string | null = null;
  for (const t of PRODUCT_TYPES) {
    const re = new RegExp(`\\b${t}\\b`, "i");
    if (re.test(title)) {
      kind = t;
      title = title.replace(re, "").replace(/\s{2,}/g, " ").trim();
      break;
    }
  }
  return { title: title || name, kind };
}
