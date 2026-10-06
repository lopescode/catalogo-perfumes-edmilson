import Image from "next/image";
import Link from "next/link";
import { STORES } from "@/config";
import { formatPrice } from "@/lib/format";
import type { Audience, ProductSummary } from "@/lib/types";
import { QuickAdd } from "./cart/QuickAdd";

const href = (p: ProductSummary) => `/perfume/${p.store}/${p.sku}`;

/** Tom de fundo da foto, de acordo com o público do perfume. */
export const AUDIENCE_TINT: Record<Audience, string> = {
  feminino: "from-[#ffe1e6] to-[#fff6f2]",
  masculino: "from-[#dfe7f5] to-[#f6f8fc]",
  unissex: "from-[#f8ecd2] to-[#fffaf0]",
  infantil: "from-[#d9f2ea] to-[#f4fcf9]",
  kits: "from-[#f3dbe6] to-[#fdf4f8]",
};

function Badge({ product: p }: { product: ProductSummary }) {
  if (p.stock === "unavailable")
    return (
      <span className="absolute left-3 top-3 z-10 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-white">
        Esgotado
      </span>
    );
  if (p.discount > 0)
    return (
      <span className="absolute left-3 top-3 z-10 rounded-full bg-linear-to-r from-accent to-wine px-2.5 py-1 text-[11px] font-bold text-white shadow-md shadow-accent/30">
        −{p.discount}%
      </span>
    );
  if (p.isRelease)
    return (
      <span className="absolute left-3 top-3 z-10 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-ink shadow-md shadow-gold/30">
        Lançamento
      </span>
    );
  return null;
}

/** Card grande do carrossel de ofertas. */
export function FeaturedCard({ product: p }: { product: ProductSummary }) {
  return (
    <div className="group relative w-56 shrink-0 snap-start rounded-[1.75rem] bg-surface shadow-[0_12px_30px_-14px_rgba(122,18,67,0.25)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(122,18,67,0.35)] sm:w-64">
      <QuickAdd product={p} className="absolute right-5 top-5" />
      <Link href={href(p)} className="flex flex-col p-3 text-center">
        <Badge product={p} />
        <div className={`relative aspect-square rounded-3xl bg-linear-to-b ${AUDIENCE_TINT[p.audience]}`}>
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="256px"
            className="object-contain p-3 mix-blend-multiply transition duration-500 group-hover:scale-105 group-hover:-rotate-2"
          />
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-accent">{p.line || STORES[p.store].label}</p>
        <p className="mt-0.5 line-clamp-2 min-h-10 px-1 text-sm font-medium uppercase leading-5">{p.name}</p>
        <p className="mb-1 mt-2 text-sm">
          <span className="mr-2 text-muted line-through">{formatPrice(p.price)}</span>
          <span className="font-bold text-wine">{formatPrice(p.salePrice)}</span>
        </p>
      </Link>
    </div>
  );
}

/** Card da grade principal. */
export function ProductCard({ product: p }: { product: ProductSummary }) {
  return (
    <div className="group relative flex w-full rounded-3xl bg-surface shadow-[0_6px_20px_-12px_rgba(122,18,67,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-14px_rgba(122,18,67,0.32)]">
      {p.stock !== "unavailable" && <QuickAdd product={p} className="absolute right-4 top-4 sm:right-5 sm:top-5" />}
      <Link href={href(p)} className="flex w-full flex-col p-2.5 sm:p-3">
        <Badge product={p} />
        <div className={`relative aspect-square overflow-hidden rounded-[1.25rem] bg-linear-to-b ${AUDIENCE_TINT[p.audience]} ${p.stock === "unavailable" ? "opacity-50 grayscale" : ""}`}>
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-2 mix-blend-multiply transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col px-1.5 pb-1">
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            {STORES[p.store].label}
            {p.size && ` · ${p.size}`}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-5">{p.name}</p>
        {p.stock === "critical" && <p className="mt-1 text-xs font-semibold text-[#b7791f]">Últimas unidades</p>}
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2 text-sm">
            {p.discount > 0 && <span className="text-xs text-muted line-through">{formatPrice(p.price)}</span>}
            <span className={`font-bold ${p.stock === "unavailable" ? "text-muted" : p.discount > 0 ? "text-wine" : ""}`}>{formatPrice(p.salePrice)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
