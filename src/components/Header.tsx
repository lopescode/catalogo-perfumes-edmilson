"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RESELLER_NAME, whatsappLink } from "@/config";
import { useCart } from "./cart/CartProvider";
import { FilterLink } from "./FilterLink";
import { Bag, Search, WhatsApp } from "./Icons";

const NAV = [
  { label: "Ofertas", query: "ordem=desconto", hot: true },
  { label: "Feminino", query: "para=feminino" },
  { label: "Masculino", query: "para=masculino" },
  { label: "Infantil", query: "para=infantil" },
  { label: "Presentes", query: "para=kits" },
];

function Logo() {
  const [first, ...rest] = RESELLER_NAME.split(" ");
  return (
    <Link href="/" className="group flex flex-col items-start leading-none" aria-label={`${RESELLER_NAME} Perfumaria, início`}>
      <span className="whitespace-nowrap font-display text-[1.4rem] font-semibold italic tracking-tight sm:text-3xl">
        {first}
        <span className="text-gradient"> {rest.join(" ")}</span>
      </span>
      <span className="mt-1 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.35em] text-muted sm:text-[10px]">
        <span className="h-px w-5 bg-accent" />
        Perfumaria
      </span>
    </Link>
  );
}

const iconButton =
  "relative grid size-11 place-items-center rounded-full transition hover:bg-blush";

export function Header({ validUntil }: { validUntil?: string }) {
  const { count, open } = useCart();
  const router = useRouter();

  const focusSearch = () => {
    const input = document.getElementById("busca");
    if (!input) return router.push("/#catalogo");
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus({ preventScroll: true });
  };

  const notices = [
    "Peça pelo WhatsApp e receba em casa",
    validUntil ? `Ofertas válidas até ${validUntil}` : "Ofertas do ciclo atual",
    "Produtos originais do Grupo Boticário",
    "O Boticário · Eudora · O.U.i · Quem Disse, Berenice?",
    "Pagamento no Pix, dinheiro ou cartão",
  ];

  return (
    <>
      {/* Faixa de avisos, rolando */}
      <div className="overflow-hidden bg-ink py-2 text-[12px] font-medium text-white">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 pr-10 hover:[animation-play-state:paused]">
          {[...notices, ...notices].map((n, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap" aria-hidden={i >= notices.length}>
              {n}
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6">
          <Logo />

          <nav aria-label="Categorias" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <FilterLink
                key={n.label}
                query={n.query}
                className={`rounded-full px-4 py-2 text-sm font-medium transition hover:bg-blush ${n.hot ? "text-accent" : ""}`}
              >
                {n.label}
              </FilterLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={focusSearch} className={iconButton} aria-label="Buscar perfumes">
              <Search className="size-[22px]" />
            </button>
            <a
              href={whatsappLink(`Olá, ${RESELLER_NAME.split(" ")[0]}! Vim pelo site de perfumes.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${iconButton} text-[#1da851]`}
              aria-label="Falar no WhatsApp"
            >
              <WhatsApp className="size-[22px]" />
            </a>
            <button onClick={open} className={`${iconButton} ml-1 bg-ink text-white hover:bg-wine`} aria-label={`Abrir sacola (${count} itens)`}>
              <Bag className="size-[22px]" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white ring-2 ring-canvas">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categorias no celular */}
        <nav aria-label="Categorias" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          {NAV.map((n) => (
            <FilterLink
              key={n.label}
              query={n.query}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
                n.hot ? "border-accent bg-accent text-white" : "border-line bg-surface"
              }`}
            >
              {n.label}
            </FilterLink>
          ))}
        </nav>
      </header>
    </>
  );
}
