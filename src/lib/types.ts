import type { StoreId } from "@/config";

export type Audience = "feminino" | "masculino" | "unissex" | "infantil" | "kits";

/** Estoque da marca no ciclo atual: "critical" = últimas unidades. */
export type Stock = "available" | "critical" | "unavailable";

/** Versão enxuta do produto, enviada ao navegador para a listagem. */
export type ProductSummary = {
  sku: string;
  store: StoreId;
  name: string;
  line: string;
  audience: Audience;
  price: number;
  salePrice: number;
  discount: number; // percentual inteiro
  size: string | null;
  image: string;
  isRelease: boolean;
  stock: Stock;
};

export type Product = ProductSummary & {
  images: string[];
  shortDescription: string | null;
  descriptionHtml: string | null;
  adviceHtml: string | null;
  olfactivePyramid: string | null;
  occasion: string | null;
};

export type ResellerInfo = {
  name: string;
  photo: string | null;
  cycleEnd: Partial<Record<StoreId, string>>;
};

export type BannerSlide = {
  product: ProductSummary;
  /** Foto de ambiente quando existe; senão, a foto do produto (fundo branco). */
  photo: string;
  isMood: boolean;
  /** Cor do fundo da foto, para o painel de texto se emendar com ela. */
  bg: string;
  darkText: boolean;
};
