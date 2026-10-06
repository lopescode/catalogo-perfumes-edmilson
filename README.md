# Catálogo de Perfumes — Edmilson França

Site-catálogo dos perfumes **O Boticário**, **Eudora**, **O.U.i** e **Quem Disse, Berenice?** vendidos pelo Edmilson.
Feito com Next.js 16 (App Router), TypeScript, Tailwind CSS v4 e pnpm.

## Como funciona

- Os produtos vêm **ao vivo** da API do catálogo "Minha Loja" do Grupo Boticário
  (`minhaloja-api.grupoboticario.digital`, a mesma da loja multimarcas do Edmilson), com
  preços do ciclo atual e **estoque** (disponível / últimas unidades / esgotado).
  O site se atualiza sozinho a cada **30 minutos**. O cliente **nunca** é mandado para a Minha Loja.
- Esgotados aparecem em cinza, no fim da lista, e não entram na sacola; quem já tinha o
  item na sacola vê o aviso e ele sai do pedido.
- O cliente monta a **sacola** (fica salva no navegador), preenche nome, forma de
  recebimento e pagamento, e o pedido é enviado já formatado para o **WhatsApp** do
  Edmilson. Ele compra e entrega.
- Os pedidos vão para o WhatsApp **+55 19 99146-6750** (definido em `src/config.ts`;
  pode ser trocado pela variável `NEXT_PUBLIC_WHATSAPP`).

## Rodando localmente

```bash
pnpm install
pnpm dev                     # http://localhost:3000
```

## Publicando (Vercel)

1. Suba o projeto para um repositório no GitHub.
2. Importe-o em https://vercel.com/new (detecta Next.js e pnpm automaticamente).

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Nome, WhatsApp, formas de pagamento | `src/config.ts` |
| Sacola e mensagem do pedido | `src/components/cart/` |
| Busca de dados / categorias | `src/lib/catalog.ts` |
| Cores e fonte | `src/app/globals.css` |
| Página inicial | `src/app/page.tsx` |
| Página do perfume | `src/app/perfume/[loja]/[sku]/page.tsx` |

> A API do Grupo Boticário não é documentada publicamente. Se ela mudar, o site
> mostra um aviso com um botão de WhatsApp em vez de quebrar.
