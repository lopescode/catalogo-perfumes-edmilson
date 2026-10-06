import "server-only";
import { RESELLER_NAME, RESELLER_SLUG, type StoreId } from "@/config";
import { prefersDarkText, type RGB, sampleBackground, toHex } from "./color";
import type { Audience, BannerSlide, Product, ProductSummary, ResellerInfo } from "./types";

const API = "https://minhaloja-api.grupoboticario.digital";
const PAGE_SIZE = 50; // máximo aceito pela API
const REVALIDATE = 60 * 30; // 30 minutos: preços e estoque acompanham a loja quase em tempo real

export const STORE_IDS: StoreId[] = ["boticario", "eudora", "oui", "euamomake"];

type ApiProduct = {
  sku: string;
  name: string;
  price: number;
  salePrice: number;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  isKit: boolean;
  isGift: boolean;
  isRelease: boolean;
  inventory?: string;
  images: string[];
  presentation: { value: string; unit: string } | null;
  details: {
    shortDescription: string | null;
    description: string | null;
    advice: string | null;
    olfactivePyramid: string | null;
    occasion: string | null;
  } | null;
};

type ApiReseller = {
  catalogName: string;
  addressHomeState: string;
  photo?: { thumbnail?: string };
  availableBusinessUnits: Partial<Record<string, { cycle: { id: string; end: string } }>>;
};

async function getRawReseller(): Promise<ApiReseller | null> {
  try {
    const res = await fetch(
      `${API}/catalog/bff/reseller/?catalogSlug=${RESELLER_SLUG}&businessUnit=boticario`,
      { next: { revalidate: REVALIDATE } },
    );
    if (!res.ok) return null;
    return (await res.json()) as ApiReseller;
  } catch {
    return null;
  }
}

async function fetchPage(store: StoreId, page: number, reseller: ApiReseller | null) {
  const body = {
    category: "perfumaria",
    page,
    pageSize: PAGE_SIZE,
    businessUnit: store,
    catalogSlug: RESELLER_SLUG,
    state: reseller?.addressHomeState,
    cycle: reseller?.availableBusinessUnits[store]?.cycle.id,
  };
  const res = await fetch(`${API}/product/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`API ${store} página ${page}: HTTP ${res.status}`);
  return (await res.json()) as { products: ApiProduct[]; count: number };
}

async function fetchStore(store: StoreId, reseller: ApiReseller | null): Promise<Product[]> {
  try {
    const first = await fetchPage(store, 1, reseller);
    const pages = Math.ceil(first.count / PAGE_SIZE);
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => fetchPage(store, i + 2, reseller)),
    );
    const seen = new Set<string>();
    const products: Product[] = [];
    for (const p of [first, ...rest].flatMap((r) => r.products)) {
      if (seen.has(p.sku) || !p.images?.length) continue;
      seen.add(p.sku);
      products.push(normalize(p, store));
    }
    return products;
  } catch (err) {
    console.error(`Falha ao carregar catálogo ${store}:`, err);
    return [];
  }
}

function audienceOf(p: ApiProduct): Audience {
  const sub = (p.subcategory ?? "").toLowerCase();
  if (p.isKit || p.isGift || sub.startsWith("kit")) return "kits";
  if (sub.startsWith("femin")) return "feminino";
  if (sub.startsWith("mascul") || sub.includes("barba")) return "masculino";
  if (sub.startsWith("infant")) return "infantil";
  return "unissex";
}

function sanitizeHtml(html: string | null | undefined) {
  if (!html) return null;
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function normalize(p: ApiProduct, store: StoreId): Product {
  const salePrice = Math.min(p.salePrice || p.price, p.price);
  const discount = p.price > salePrice ? Math.round((1 - salePrice / p.price) * 100) : 0;
  const unit = p.presentation?.unit.toLowerCase() ?? "";
  const size = p.presentation?.value
    ? `${p.presentation.value}${unit.length <= 2 ? "" : " "}${unit}` // "90ml", "2 produtos"
    : null;
  return {
    sku: p.sku,
    store,
    name: p.name,
    line: p.brand ?? "",
    audience: audienceOf(p),
    price: p.price,
    salePrice,
    discount,
    size,
    image: p.images[0],
    images: p.images,
    isRelease: p.isRelease,
    stock: p.inventory === "unavailable" ? "unavailable" : p.inventory === "critical" ? "critical" : "available",
    shortDescription: p.details?.shortDescription?.trim() || null,
    descriptionHtml: sanitizeHtml(p.details?.description),
    adviceHtml: sanitizeHtml(p.details?.advice),
    olfactivePyramid: p.details?.olfactivePyramid?.trim() || null,
    occasion: p.details?.occasion?.trim() || null,
  };
}

export async function getProducts(): Promise<Product[]> {
  const reseller = await getRawReseller();
  const lists = await Promise.all(STORE_IDS.map((s) => fetchStore(s, reseller)));
  return lists.flat();
}

export function toSummary(p: Product): ProductSummary {
  return {
    sku: p.sku,
    store: p.store,
    name: p.name,
    line: p.line,
    audience: p.audience,
    price: p.price,
    salePrice: p.salePrice,
    discount: p.discount,
    size: p.size,
    image: p.image,
    isRelease: p.isRelease,
    stock: p.stock,
  };
}

export async function getProduct(store: StoreId, sku: string) {
  const all = await getProducts();
  return all.find((p) => p.store === store && p.sku === sku) ?? null;
}

export async function getReseller(): Promise<ResellerInfo> {
  const r = await getRawReseller();
  const cycleEnd: ResellerInfo["cycleEnd"] = {};
  for (const s of STORE_IDS) {
    const end = r?.availableBusinessUnits[s]?.cycle.end;
    if (end) cycleEnd[s] = end;
  }
  return { name: RESELLER_NAME, photo: r?.photo?.thumbnail ?? null, cycleEnd };
}

const MOOD_PHOTO = /ambientad/i;

/** Fundo pastel para slides sem foto de ambiente (a foto do produto tem fundo branco). */
const FALLBACK_BG: Record<Product["audience"], RGB> = {
  feminino: [255, 222, 226],
  masculino: [221, 230, 245],
  unissex: [248, 234, 205],
  infantil: [214, 241, 232],
  kits: [243, 219, 230],
};

/**
 * As maiores promoções para o banner: uma por linha (sem repetir três "Instance"),
 * dando preferência às que têm foto de ambiente, que deixam o banner mais bonito.
 */
export async function getBannerSlides(count = 5): Promise<BannerSlide[]> {
  const products = await getProducts();
  const seenLines = new Set<string>();
  const candidates: Product[] = [];
  for (const p of [...products]
    .filter((p) => p.discount > 0 && p.audience !== "kits" && p.stock !== "unavailable")
    .sort((a, b) => b.discount - a.discount || b.price - a.price)) {
    const line = `${p.store}:${p.line}`;
    if (seenLines.has(line)) continue;
    seenLines.add(line);
    candidates.push(p);
  }
  const pool = candidates.slice(0, count * 4);
  const withMood = pool.filter((p) => p.images.some((i) => MOOD_PHOTO.test(i)));
  const chosen = [...withMood, ...pool.filter((p) => !withMood.includes(p))]
    .slice(0, count)
    .sort((a, b) => b.discount - a.discount);

  return Promise.all(
    chosen.map(async (p) => {
      const mood = p.images.find((i) => MOOD_PHOTO.test(i)) ?? null;
      const sampled = mood ? await sampleBackground(mood) : null;
      const bg = sampled ?? FALLBACK_BG[p.audience];
      return {
        product: toSummary(p),
        photo: sampled && mood ? mood : p.image,
        isMood: Boolean(sampled && mood),
        bg: toHex(bg),
        darkText: prefersDarkText(bg),
      };
    }),
  );
}
