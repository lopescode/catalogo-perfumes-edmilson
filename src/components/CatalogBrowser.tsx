"use client";

import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { STORES, type StoreId } from "@/config";
import { AUDIENCE_LABEL } from "@/lib/format";
import type { Audience, ProductSummary } from "@/lib/types";
import { Search } from "./Icons";
import { ProductCard } from "./ProductCard";

const PAGE = 24;

type Sort = "relevancia" | "menor-preco" | "maior-preco" | "desconto";
const SORT_LABEL: Record<Sort, string> = {
  relevancia: "Relevância",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  desconto: "Maior desconto",
};

const AUDIENCE_TILE: Record<Audience | "todos", string> = {
  todos: "from-[#2b0f1f] to-[#7a1243]",
  feminino: "from-[#ff7a8a] to-[#d63a6a]",
  masculino: "from-[#3b5b9a] to-[#14213d]",
  unissex: "from-[#f2b441] to-[#c7741c]",
  infantil: "from-[#4cc7a6] to-[#1f8a7a]",
  kits: "from-[#b04a8f] to-[#5b1a5e]",
};

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-linear-to-r from-accent to-wine text-white shadow-md shadow-accent/25"
          : "bg-surface text-ink shadow-sm hover:bg-blush"
      }`}
    >
      {children}
    </button>
  );
}

export function CatalogBrowser({ products }: { products: ProductSummary[] }) {
  // Loja, público e ordem vivem na URL, então o menu do topo (e o botão voltar) também filtram.
  const params = useSearchParams();
  const store = (params.get("loja") as StoreId) || null;
  const audience = (params.get("para") as Audience) || null;
  const sort = (params.get("ordem") as Sort) || "relevancia";
  const onlyAvailable = params.get("disponiveis") === "1";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);

  const filterKey = `${store}|${audience}|${sort}|${onlyAvailable}|${deferredQuery}`;
  const [paging, setPaging] = useState({ key: filterKey, limit: PAGE });
  const limit = paging.key === filterKey ? paging.limit : PAGE;

  function update(next: { q?: string; loja?: string | null; para?: string | null; ordem?: string; disponiveis?: string | null }) {
    const sp = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v && v !== "relevancia") sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: 0 };
    for (const p of products) {
      if (store && p.store !== store) continue;
      c.todos++;
      c[p.audience] = (c[p.audience] ?? 0) + 1;
    }
    return c;
  }, [products, store]);

  const filtered = useMemo(() => {
    const terms = fold(deferredQuery).split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      if (store && p.store !== store) return false;
      if (audience && p.audience !== audience) return false;
      if (onlyAvailable && p.stock === "unavailable") return false;
      if (terms.length) {
        const hay = fold(`${p.name} ${p.line} ${STORES[p.store].label}`);
        return terms.every((t) => hay.includes(t));
      }
      return true;
    });
    if (sort === "menor-preco") list.sort((a, b) => a.salePrice - b.salePrice);
    if (sort === "maior-preco") list.sort((a, b) => b.salePrice - a.salePrice);
    if (sort === "desconto") list.sort((a, b) => b.discount - a.discount);
    // Esgotados sempre no fim (o sort do JS é estável, então a ordem escolhida se mantém)
    list.sort((a, b) => Number(a.stock === "unavailable") - Number(b.stock === "unavailable"));
    return list;
  }, [products, deferredQuery, store, audience, sort, onlyAvailable]);

  const availableCount = filtered.filter((p) => p.stock !== "unavailable").length;

  return (
    <section id="catalogo" className="scroll-mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl">
          <span className="font-semibold">Todos os</span>{" "}
          <span className="font-display italic text-gradient">Perfumes</span>
        </h2>
        <span className="text-sm text-muted">
          {filtered.length} produtos · <span className="font-semibold text-[#1d8a4c]">{availableCount} disponíveis</span>
        </span>
      </div>

      <label className="mt-4 flex h-14 items-center gap-3 rounded-full bg-surface px-5 shadow-[0_8px_24px_-14px_rgba(122,18,67,0.35)] focus-within:ring-2 focus-within:ring-accent">
        <Search className="size-5 text-accent" />
        <input
          id="busca"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            update({ q: e.target.value });
          }}
          placeholder="Buscar por nome ou linha (ex.: Malbec, Floratta, Club 6)"
          className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted"
        />
      </label>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={!store} onClick={() => update({ loja: null })}>
          Todas as lojas
        </Chip>
        {(Object.keys(STORES) as StoreId[]).map((s) => (
          <Chip key={s} active={store === s} onClick={() => update({ loja: s })}>
            {STORES[s].label}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-6 sm:px-0">
        {([null, ...(Object.keys(AUDIENCE_LABEL) as Audience[])] as (Audience | null)[]).map((a) => {
          const active = audience === a;
          return (
            <button
              key={a ?? "todos"}
              type="button"
              aria-pressed={active}
              onClick={() => update({ para: a })}
              className={`relative flex h-20 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-linear-to-br p-3 text-left text-white transition sm:w-auto ${
                AUDIENCE_TILE[a ?? "todos"]
              } ${active ? "ring-2 ring-ink ring-offset-2 ring-offset-canvas" : "opacity-80 hover:opacity-100"}`}
            >
              <span aria-hidden className="absolute -right-4 -top-4 size-14 rounded-full bg-white/20" />
              <span className="text-[11px] text-white/80">{counts[a ?? "todos"] ?? 0} itens</span>
              <span className="text-sm font-semibold leading-tight">{a ? AUDIENCE_LABEL[a] : "Todos"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 font-medium">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => update({ disponiveis: e.target.checked ? "1" : null })}
            className="peer sr-only"
          />
          <span className="relative h-6 w-11 rounded-full bg-line transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-[#1d8a4c] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
          Só disponíveis
        </label>
        <div className="flex items-center gap-2">
        <label htmlFor="ordem" className="text-muted">Ordenar por</label>
        <select
          id="ordem"
          value={sort}
          onChange={(e) => {
            update({ ordem: e.target.value });
          }}
          className="rounded-full bg-surface px-3 py-2 shadow-sm outline-none"
        >
          {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
            <option key={s} value={s}>{SORT_LABEL[s]}</option>
          ))}
        </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted">Nenhum perfume encontrado com esses filtros.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filtered.slice(0, limit).map((p) => (
            <li key={`${p.store}:${p.sku}`} className="flex">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}

      {filtered.length > limit && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setPaging({ key: filterKey, limit: limit + PAGE })}
            className="rounded-full bg-linear-to-r from-accent to-wine px-8 py-4 font-semibold text-white shadow-lg shadow-accent/30 transition hover:brightness-110"
          >
            Ver mais perfumes
          </button>
        </div>
      )}
    </section>
  );
}
