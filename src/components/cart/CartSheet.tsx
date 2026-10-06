"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PAYMENT_OPTIONS, RESELLER_NAME, STORES, whatsappLink } from "@/config";
import { formatPrice } from "@/lib/format";
import { ArrowLeft, Bag, Close, WhatsApp } from "../Icons";
import { QtyStepper } from "../QtyStepper";
import { type CartItem, useCart } from "./CartProvider";

type Step = "sacola" | "dados" | "enviado";
type Delivery = "entrega" | "retirada";
type Customer = {
  name: string;
  delivery: Delivery;
  address: string;
  payment: (typeof PAYMENT_OPTIONS)[number];
  notes: string;
};

const CUSTOMER_KEY = "cliente-v1";
const EMPTY_CUSTOMER: Customer = { name: "", delivery: "entrega", address: "", payment: "Pix", notes: "" };

function loadCustomer(): Customer {
  try {
    return { ...EMPTY_CUSTOMER, ...JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}") };
  } catch {
    return EMPTY_CUSTOMER;
  }
}

function saveCustomer(c: Customer) {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ ...c, notes: "" }));
  } catch {
    // sem armazenamento: o cliente só preenche de novo na próxima vez
  }
}

function buildMessage(items: CartItem[], total: number, c: Customer) {
  const firstName = RESELLER_NAME.split(" ")[0];
  return [
    `Olá, ${firstName}! Quero fazer um pedido pelo site:`,
    "",
    "*Itens*",
    ...items.map(
      ({ product: p, qty }) =>
        `• ${qty}x ${p.name} (${STORES[p.store].label} · cód. ${p.sku}) — ${formatPrice(p.salePrice * qty)}`,
    ),
    "",
    `*Total: ${formatPrice(total)}*`,
    "",
    `*Nome:* ${c.name.trim()}`,
    c.delivery === "entrega" ? `*Entrega em:* ${c.address.trim()}` : "*Recebimento:* vou retirar",
    `*Pagamento:* ${c.payment}`,
    ...(c.notes.trim() ? [`*Obs.:* ${c.notes.trim()}`] : []),
  ].join("\n");
}

const field =
  "w-full rounded-2xl border border-line bg-soft/60 px-4 py-3 text-base outline-none transition focus:border-accent focus:bg-white";

export function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<Step>("sacola");
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const close = () => {
    onClose();
    if (step !== "dados") setStep("sacola");
  };

  // Itens que esgotaram depois de entrar na sacola ficam visíveis, mas fora do pedido e do total.
  const orderable = items.filter((i) => i.product.stock !== "unavailable");
  const soldOut = items.length - orderable.length;
  const fullTotal = orderable.reduce((n, i) => n + i.product.price * i.qty, 0);
  const total = orderable.reduce((n, i) => n + i.product.salePrice * i.qty, 0);
  const count = orderable.reduce((n, i) => n + i.qty, 0);

  const missing = {
    name: !customer.name.trim(),
    address: customer.delivery === "entrega" && !customer.address.trim(),
  };
  const valid = !missing.name && !missing.address;
  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => setCustomer((c) => ({ ...c, [k]: v }));

  const title = { sacola: "Minha sacola", dados: "Finalizar pedido", enviado: "Pedido enviado" }[step];

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? "visible" : "invisible"}`} aria-hidden={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label={title}
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 sm:rounded-l-4xl ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between px-6 pb-4 pt-6">
          <button
            onClick={() => (step === "dados" ? setStep("sacola") : close())}
            className="-ml-2 rounded-full p-2 hover:bg-blush"
            aria-label={step === "dados" ? "Voltar para a sacola" : "Fechar sacola"}
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="relative">
            <Bag className="size-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </span>
        </header>

        {step === "enviado" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-[#25d366] text-white">
              <WhatsApp className="size-8" />
            </span>
            <p className="text-xl font-semibold">Seu pedido foi para o WhatsApp!</p>
            <p className="text-muted">
              Confira a mensagem e toque em enviar. O {RESELLER_NAME.split(" ")[0]} responde por lá para combinar o
              pagamento e a entrega.
            </p>
            <div className="mt-4 flex w-full flex-col gap-2">
              <button
                onClick={() => {
                  clear();
                  setStep("sacola");
                  onClose();
                }}
                className="h-12 rounded-full bg-linear-to-r from-accent to-wine font-semibold text-white"
              >
                Já enviei, esvaziar sacola
              </button>
              <button onClick={() => setStep("dados")} className="h-12 rounded-full text-sm font-medium text-wine hover:bg-blush">
                Voltar ao pedido
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-blush text-accent">
              <Bag className="size-8" />
            </span>
            <p className="font-medium">Sua sacola está vazia</p>
            <p className="text-sm text-muted">Escolha seus perfumes e envie o pedido pelo WhatsApp.</p>
            <button onClick={close} className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
              Ver perfumes
            </button>
          </div>
        ) : step === "sacola" ? (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-2">
              {items.map(({ product: p, qty }) => (
                <li key={`${p.store}:${p.sku}`} className={`flex gap-4 ${p.stock === "unavailable" ? "opacity-60" : ""}`}>
                  <Link
                    href={`/perfume/${p.store}/${p.sku}`}
                    onClick={close}
                    className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-soft"
                  >
                    <Image src={p.image} alt={p.name} fill sizes="96px" className="object-contain p-2 mix-blend-multiply" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug">{p.name}</p>
                      <button onClick={() => remove(p)} className="text-muted hover:text-ink" aria-label={`Remover ${p.name}`}>
                        <Close className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted">{[p.size, STORES[p.store].label].filter(Boolean).join(" · ")}</p>
                    {p.stock === "unavailable" && (
                      <p className="mt-1 text-xs font-semibold text-accent">Esgotou: não vai no pedido</p>
                    )}
                    {p.stock === "critical" && <p className="mt-1 text-xs font-semibold text-[#b7791f]">Últimas unidades</p>}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="-ml-2">
                        <QtyStepper size="sm" value={qty} onChange={(n) => setQty(p, n)} />
                      </div>
                      <p className="font-semibold text-wine">{formatPrice(p.salePrice * qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-2 border-t border-line px-6 pb-6 pt-4">
              {soldOut > 0 && (
                <p className="rounded-2xl bg-blush px-4 py-2 text-xs text-wine">
                  {soldOut === 1 ? "1 item esgotou" : `${soldOut} itens esgotaram`} e ficou fora do pedido.
                </p>
              )}
              {fullTotal > total && (
                <div className="flex justify-between text-sm text-muted">
                  <span>Você economiza</span>
                  <span className="font-semibold text-accent">{formatPrice(fullTotal - total)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span className="font-bold text-wine">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted">Frete e prazo são combinados pelo WhatsApp.</p>
              <button
                disabled={count === 0}
                onClick={() => {
                  setCustomer(loadCustomer());
                  setTried(false);
                  setStep("dados");
                }}
                className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-linear-to-r from-accent to-wine text-lg font-semibold text-white shadow-lg shadow-accent/30 transition hover:brightness-110 disabled:opacity-40"
              >
                Continuar
              </button>
            </footer>
          </>
        ) : (
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              setTried(true);
              if (!valid) return;
              saveCustomer(customer);
              window.open(whatsappLink(buildMessage(orderable, total, customer)), "_blank", "noopener");
              setStep("enviado");
            }}
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Seu nome</span>
                <input
                  value={customer.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  className={`${field} ${tried && missing.name ? "border-accent" : ""}`}
                  placeholder="Como podemos te chamar?"
                />
                {tried && missing.name && <span className="text-xs text-accent">Informe seu nome.</span>}
              </label>

              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Como quer receber?</legend>
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  {(
                    [
                      ["entrega", "Entrega"],
                      ["retirada", "Vou retirar"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={customer.delivery === v}
                      onClick={() => set("delivery", v)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        customer.delivery === v
                          ? "border-wine bg-wine text-white"
                          : "border-line bg-soft/60 hover:border-wine/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {customer.delivery === "entrega" && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Endereço de entrega</span>
                  <textarea
                    value={customer.address}
                    onChange={(e) => set("address", e.target.value)}
                    autoComplete="street-address"
                    rows={2}
                    className={`${field} resize-none ${tried && missing.address ? "border-accent" : ""}`}
                    placeholder="Rua, número, bairro e cidade"
                  />
                  {tried && missing.address && <span className="text-xs text-accent">Informe o endereço.</span>}
                </label>
              )}

              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Forma de pagamento</legend>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={customer.payment === opt}
                      onClick={() => set("payment", opt)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        customer.payment === opt
                          ? "border-wine bg-wine text-white"
                          : "border-line bg-soft/60 hover:border-wine/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">
                  Observação <span className="font-normal text-muted">(opcional)</span>
                </span>
                <textarea
                  value={customer.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  className={`${field} resize-none`}
                  placeholder="Ex.: é presente, embalar separado"
                />
              </label>
            </div>

            <footer className="space-y-3 border-t border-line px-6 pb-6 pt-4">
              <div className="flex justify-between text-lg">
                <span>
                  Total <span className="text-sm text-muted">({count} {count === 1 ? "item" : "itens"})</span>
                </span>
                <span className="font-bold text-wine">{formatPrice(total)}</span>
              </div>
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] text-lg font-semibold text-white shadow-lg shadow-[#25d366]/30 transition hover:brightness-105"
              >
                <WhatsApp /> Enviar pedido no WhatsApp
              </button>
            </footer>
          </form>
        )}
      </aside>
    </div>
  );
}
