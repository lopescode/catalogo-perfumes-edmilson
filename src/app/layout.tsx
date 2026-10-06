import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { RESELLER_NAME } from "@/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: {
    default: `${RESELLER_NAME} Perfumaria | O Boticário, Eudora e O.U.i`,
    template: `%s | ${RESELLER_NAME} Perfumaria`,
  },
  description:
    "Perfumes O Boticário, Eudora, O.U.i e Quem Disse, Berenice? com preços do ciclo atual. Monte sua sacola e peça pelo WhatsApp.",
};

export const viewport: Viewport = { themeColor: "#fbf5f1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
