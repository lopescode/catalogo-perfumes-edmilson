"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Link para o catálogo já filtrado (ex.: "?para=feminino"). Na página inicial, só troca a URL
 * e rola até o catálogo, sem recarregar; nas outras páginas, navega normalmente.
 */
export function FilterLink({
  query,
  className,
  children,
}: {
  query: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const href = `/${query ? `?${query}` : ""}#catalogo`;

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (pathname !== "/") return;
        e.preventDefault();
        window.history.pushState(null, "", query ? `/?${query}` : "/");
        document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {children}
    </Link>
  );
}
