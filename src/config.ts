/** Loja "Minha Loja" usada só como fonte do catálogo e dos preços. Os clientes não são enviados para lá. */
export const RESELLER_SLUG = "loja-edmilsonfranca-27034896";
export const RESELLER_NAME = "Edmilson França";

export type StoreId = "boticario" | "eudora" | "oui" | "euamomake";

export const STORES: Record<StoreId, { label: string }> = {
  boticario: { label: "O Boticário" },
  eudora: { label: "Eudora" },
  oui: { label: "O.U.i" },
  euamomake: { label: "Quem Disse, Berenice?" },
};

/**
 * WhatsApp que recebe os pedidos: DDI + DDD + número, só dígitos.
 * A variável de ambiente NEXT_PUBLIC_WHATSAPP, se existir, substitui este número.
 */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP || "5519991466750").replace(/\D/g, "");

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const PAYMENT_OPTIONS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito"] as const;
