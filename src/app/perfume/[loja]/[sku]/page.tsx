import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyActions } from "@/components/BuyActions";
import { CartSync } from "@/components/cart/CartSync";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { AUDIENCE_TINT, ProductCard } from "@/components/ProductCard";
import { STORES, type StoreId } from "@/config";
import { getProduct, getProducts, toSummary } from "@/lib/catalog";
import { AUDIENCE_LABEL, formatPrice } from "@/lib/format";

export const revalidate = 1800; // 30 minutos

// Nenhuma página gerada no build: cada perfume é renderizado na 1ª visita e fica em cache (ISR).
export async function generateStaticParams() {
  return [];
}

type Props = PageProps<"/perfume/[loja]/[sku]">;

async function load(params: Props["params"]) {
  const { loja, sku } = await params;
  if (!(loja in STORES)) return null;
  return getProduct(loja as StoreId, sku);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load(params);
  if (!p) return {};
  return {
    title: p.name,
    description: p.shortDescription ?? `${p.name} por ${formatPrice(p.salePrice)}`,
    openGraph: { images: [p.image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await load(params);
  if (!product) notFound();

  const related = (await getProducts())
    .filter(
      (p) =>
        p.store === product.store &&
        p.sku !== product.sku &&
        (p.line === product.line || p.audience === product.audience),
    )
    .filter((p) => p.stock !== "unavailable")
    .sort((a, b) => Number(b.line === product.line) - Number(a.line === product.line))
    .slice(0, 8)
    .map(toSummary);

  const facts = [
    ["Loja", STORES[product.store].label],
    ["Linha", product.line],
    ["Para", AUDIENCE_LABEL[product.audience]],
    ["Tamanho", product.size],
    ["Ocasião", product.occasion],
    ["Código", product.sku],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <>
      <CartSync products={[toSummary(product)]} />
      <Header />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10 [&>*]:min-w-0">
          <div className={`rounded-4xl bg-linear-to-b p-5 shadow-[0_20px_50px_-30px_rgba(122,18,67,0.4)] sm:p-8 lg:sticky lg:top-6 lg:self-start ${AUDIENCE_TINT[product.audience]}`}>
            <Gallery images={product.images} alt={product.name} />
          </div>

          <div className="space-y-6">
            <div className="rounded-4xl bg-surface p-6 shadow-[0_12px_30px_-20px_rgba(122,18,67,0.3)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{product.line}</p>
                  <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">{product.name}</h1>
                  {product.size && <p className="mt-1 text-muted">{product.size}</p>}
                </div>
                <div className="shrink-0 text-right">
                  {product.discount > 0 && (
                    <p className="text-muted line-through">{formatPrice(product.price)}</p>
                  )}
                  <p className="text-2xl font-bold text-wine">{formatPrice(product.salePrice)}</p>
                  {product.discount > 0 && (
                    <p className="mt-1 inline-block rounded-full bg-linear-to-r from-accent to-wine px-2.5 py-0.5 text-xs font-bold text-white">
                      {product.discount}% off
                    </p>
                  )}
                </div>
              </div>

              {product.shortDescription && <p className="mt-5 text-muted">{product.shortDescription}</p>}

              <div className="mt-6">
                <BuyActions product={toSummary(product)} />
              </div>
            </div>

            <div className="rounded-4xl bg-surface p-6 shadow-[0_12px_30px_-20px_rgba(122,18,67,0.3)] sm:p-8">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className={v.length > 30 ? "col-span-2" : undefined}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              {product.olfactivePyramid && (
                <div className="mt-6">
                  <h2 className="font-semibold">Pirâmide olfativa</h2>
                  <p className="mt-2 whitespace-pre-line text-sm text-muted">{product.olfactivePyramid}</p>
                </div>
              )}

              {product.descriptionHtml && (
                <details className="group mt-6 border-t border-line pt-5" open>
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                    Sobre o produto
                    <span className="text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <div
                    className="prose-product mt-3 text-sm leading-relaxed text-muted"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                </details>
              )}

              {product.adviceHtml && (
                <details className="group mt-5 border-t border-line pt-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                    Como usar
                    <span className="text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <div
                    className="prose-product mt-3 text-sm leading-relaxed text-muted"
                    dangerouslySetInnerHTML={{ __html: product.adviceHtml }}
                  />
                </details>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl sm:text-3xl">
              <span className="font-semibold">Você também</span>{" "}
              <span className="font-display italic text-gradient">pode gostar</span>
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.sku} className="flex">
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
