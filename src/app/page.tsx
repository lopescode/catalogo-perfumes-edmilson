import { Suspense } from "react";
import { CartSync } from "@/components/cart/CartSync";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { FeaturedCard } from "@/components/ProductCard";
import { RESELLER_NAME, whatsappLink } from "@/config";
import { getBannerSlides, getProducts, getReseller, toSummary } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export const revalidate = 1800; // 30 minutos

const STEPS = [
  { title: "Monte sua sacola", text: "Escolha os perfumes e as quantidades." },
  { title: "Envie pelo WhatsApp", text: "O pedido chega pronto, com nome, entrega e pagamento." },
  { title: "Receba em casa", text: `O ${RESELLER_NAME.split(" ")[0]} confirma e leva até você.` },
];

export default async function Home() {
  const [products, reseller, slides] = await Promise.all([getProducts(), getReseller(), getBannerSlides(5)]);
  const summaries = products.map(toSummary);

  const inBanner = new Set(slides.map((s) => `${s.product.store}:${s.product.sku}`));
  const deals = summaries
    .filter((p) => p.discount > 0 && p.audience !== "kits" && p.stock !== "unavailable" && !inBanner.has(`${p.store}:${p.sku}`))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 12);

  const ends = Object.values(reseller.cycleEnd).sort();
  const validUntil = ends[0] ? formatDate(ends[0]) : undefined;
  const dealsCount = summaries.filter((p) => p.discount > 0 && p.stock !== "unavailable").length;

  return (
    <>
      <CartSync products={summaries} />
      <Header validUntil={validUntil} />
      <PromoBanner slides={slides} validUntil={validUntil} />
      <div className="hero-glow">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <section className="pb-2 pt-10 sm:pt-14">
            <h1 className="text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
              <span className="font-bold">Encontre o</span>{" "}
              <span className="font-display font-semibold italic text-gradient">Perfume</span>
              <br />
              <span className="font-light">ideal para você</span>
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted sm:text-base">
              <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">
                {dealsCount} produtos em promoção
              </span>
              {validUntil && <span>Preços do ciclo atual, válidos até {validUntil}</span>}
            </p>
          </section>

          <ol className="grid gap-3 pb-2 pt-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex items-start gap-4 rounded-3xl bg-surface/80 p-5 shadow-sm backdrop-blur">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-wine font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold">{step.title}</span>
                  <span className="block text-sm text-muted">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-surface p-8 text-center">
            <p className="font-medium">Não foi possível carregar o catálogo agora.</p>
            <a href={whatsappLink("Olá! Quero ver os perfumes disponíveis.")} className="mt-3 inline-block text-accent">
              Pedir o catálogo pelo WhatsApp
            </a>
          </div>
        ) : (
          <>
            {deals.length > 0 && (
              <section className="pb-8 pt-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl">
                    <span className="font-semibold">Mais</span>{" "}
                    <span className="font-display italic text-gradient">ofertas</span>
                  </h2>
                  <a
                    href="?ordem=desconto#catalogo"
                    className="rounded-full bg-surface px-4 py-2 text-xs font-semibold text-accent shadow-sm transition hover:bg-blush"
                  >
                    Ver todas
                  </a>
                </div>
                <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-6 pt-2 sm:-mx-6 sm:px-6">
                  {deals.map((p) => (
                    <FeaturedCard key={`${p.store}:${p.sku}`} product={p} />
                  ))}
                </div>
              </section>
            )}

            <Suspense>
              <CatalogBrowser products={summaries} />
            </Suspense>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
