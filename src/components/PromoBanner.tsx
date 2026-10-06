"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STORES } from "@/config";
import { formatPrice, splitProductName } from "@/lib/format";
import type { BannerSlide } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { ArrowLeft, Bag, ChevronRight } from "./Icons";

const SLIDE_MS = 6000;

export function PromoBanner({ slides, validUntil }: { slides: BannerSlide[]; validUntil?: string }) {
  const { add } = useCart();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const timer = useRef({ index: 0, remaining: SLIDE_MS });
  const total = slides.length;

  // Avança sozinho; ao pausar (mouse/foco), guarda o tempo que faltava para retomar dali.
  useEffect(() => {
    if (paused || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current.index !== index) timer.current = { index, remaining: SLIDE_MS };
    const start = Date.now();
    const id = setTimeout(() => setIndex((index + 1) % total), timer.current.remaining);
    return () => {
      clearTimeout(id);
      timer.current.remaining -= Date.now() - start;
    };
  }, [index, paused, total]);

  if (!total) return null;

  const go = (i: number) => setIndex((i + total) % total);
  const slide = slides[index];
  const p = slide.product;
  const { title, kind } = splitProductName(p.name);
  const dark = slide.darkText;
  const soft = dark ? "text-ink/70" : "text-white/80";
  const outline = dark ? "border-ink/25 hover:bg-ink/5" : "border-white/50 hover:bg-white/10";

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Melhores promoções"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(e) => (touchX.current = e.clientX)}
      onPointerUp={(e) => {
        if (touchX.current === null) return;
        const dx = e.clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      }}
      style={{ backgroundColor: slide.bg }}
      className={`relative isolate overflow-hidden transition-colors duration-700 select-none ${dark ? "text-ink" : "text-white"}`}
    >
      {/* Fotos: no celular ficam em cima; no computador ocupam a metade direita, até a borda */}
      <div className="relative aspect-[5/4] w-full sm:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[54%]">
        {slides.map((s, i) => (
          <div
            key={s.product.sku}
            aria-hidden={i !== index}
            style={{ backgroundColor: s.bg }}
            className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={s.photo}
              alt={i === index ? s.product.name : ""}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 54vw, 100vw"
              className={`${
                s.isMood ? "object-cover" : "object-contain p-10 mix-blend-multiply sm:p-16"
              } transition-transform duration-[6500ms] ease-out ${i === index ? "scale-105" : "scale-100"}`}
            />
          </div>
        ))}
        {/* Fusão da foto com o painel de cor: de baixo no celular, da esquerda no computador */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 [--fade-dir:to_top] lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/3 lg:[--fade-dir:to_right]"
          style={{ background: `linear-gradient(var(--fade-dir), ${slide.bg}, transparent)` }}
        />

        {/* Selo de desconto */}
        <div
          key={`selo-${p.sku}`}
          className="absolute left-4 top-4 grid size-24 -rotate-12 animate-[pop_.5s_cubic-bezier(.2,1.4,.4,1)] place-items-center rounded-full bg-linear-to-br from-accent to-wine text-center text-white shadow-xl ring-4 ring-white/40 sm:size-28 lg:top-14 lg:left-10"
        >
          <span className="leading-none">
            <span className="block text-3xl font-extrabold sm:text-4xl">{p.discount}%</span>
            <span className="block text-xs font-bold tracking-[0.2em]">OFF</span>
          </span>
        </div>
      </div>

      {/* Texto */}
      <div className="relative mx-auto flex max-w-6xl px-4 sm:px-6 lg:min-h-[36rem] lg:items-center">
        <div key={p.sku} className="w-full animate-[slide-in_.6s_ease] pb-28 pt-1 lg:w-[44%] lg:py-20">
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${soft}`}>
            {STORES[p.store].label}
            {validUntil && <> · oferta até {validUntil}</>}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h2>
          <p className={`mt-2 text-sm ${soft}`}>{[kind, p.size].filter(Boolean).join(" · ")}</p>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">{formatPrice(p.salePrice)}</span>
            <span className={`pb-1.5 text-base line-through ${soft}`}>{formatPrice(p.price)}</span>
          </div>
          <p className={`mt-1 text-sm font-medium ${soft}`}>Você economiza {formatPrice(p.price - p.salePrice)}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => add(p, 1, false)}
              className={`inline-flex h-13 items-center gap-2 rounded-full px-7 font-semibold shadow-lg transition hover:scale-[1.03] active:scale-95 ${
                dark ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              <Bag className="size-5" /> Adicionar à sacola
            </button>
            <Link
              href={`/perfume/${p.store}/${p.sku}`}
              className={`inline-flex h-13 items-center gap-1 rounded-full border px-5 font-semibold transition hover:gap-2 ${outline}`}
            >
              Detalhes <ChevronRight />
            </Link>
          </div>
        </div>

        {/* Navegação: miniaturas das ofertas, com a barra de tempo na ativa */}
        <div className="absolute inset-x-4 bottom-5 flex items-end gap-2 sm:inset-x-6 lg:right-auto lg:w-[44%]">
          {slides.map((s, i) => (
            <button
              key={s.product.sku}
              onClick={() => go(i)}
              aria-label={`Oferta ${i + 1}: ${s.product.name}`}
              aria-current={i === index}
              className="group flex-1"
            >
              <span
                className={`relative mx-auto block aspect-square w-full max-w-14 overflow-hidden rounded-2xl bg-white shadow-md transition ${
                  i === index ? "-translate-y-1 ring-2 ring-current" : "opacity-70 group-hover:opacity-100"
                }`}
              >
                <Image src={s.product.image} alt="" fill sizes="56px" className="object-contain p-1" />
              </span>
              <span className={`mx-auto mt-2 block h-1 max-w-14 overflow-hidden rounded-full ${dark ? "bg-ink/15" : "bg-white/30"}`}>
                {i < index && <span className="block h-full bg-current" />}
                {i === index && (
                  <span
                    key={index}
                    className="block h-full origin-left bg-current"
                    style={{
                      animation: `progress ${SLIDE_MS}ms linear`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </span>
            </button>
          ))}
          <span className="ml-2 hidden gap-2 sm:flex">
            <button
              onClick={() => go(index - 1)}
              aria-label="Oferta anterior"
              className={`grid size-11 place-items-center rounded-full border transition ${outline}`}
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Próxima oferta"
              className={`grid size-11 place-items-center rounded-full border transition ${outline}`}
            >
              <ArrowLeft className="size-5 rotate-180" />
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
