import { RESELLER_NAME, whatsappLink } from "@/config";
import { WhatsApp } from "./Icons";

export function Footer() {
  const firstName = RESELLER_NAME.split(" ")[0];
  return (
    <footer className="relative mt-16 overflow-hidden rounded-t-4xl bg-linear-to-br from-[#2b0f1f] via-wine to-[#b0304f] px-6 py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xl">
            <span className="font-semibold">Perfumes</span>{" "}
            <span className="font-display italic text-gold">{RESELLER_NAME}</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Produtos originais O Boticário, Eudora, O.U.i e Quem Disse, Berenice? Monte sua sacola, envie pelo WhatsApp e o {firstName} cuida
            do resto.
          </p>
        </div>
        <a
          href={whatsappLink(`Olá, ${firstName}! Vim pelo site de perfumes.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-full bg-[#25d366] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-105 sm:self-auto"
        >
          <WhatsApp /> Falar no WhatsApp
        </a>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-white/60">
        Preços de referência do ciclo atual das marcas. Disponibilidade e frete confirmados no atendimento.
      </p>
    </footer>
  );
}
