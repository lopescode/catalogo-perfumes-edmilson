"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const pics = images.slice(0, 6);

  return (
    <div>
      <div className="relative aspect-square">
        <Image
          key={pics[active]}
          src={pics[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 520px, 100vw"
          className="animate-[fade_.35s_ease] object-contain mix-blend-multiply"
        />
      </div>

      {pics.length > 1 && (
        <>
          <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
            {pics.map((src, i) =>
              i === active ? (
                <span key={src} className="size-4 rounded-full border-[3px] border-accent border-r-transparent" />
              ) : (
                <span key={src} className="size-1.5 rounded-full bg-muted/50" />
              ),
            )}
          </div>
          <div className="no-scrollbar mt-5 flex justify-center-safe gap-3 overflow-x-auto p-1">
            {pics.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === active}
                className={`relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface shadow-[0_6px_20px_-10px_rgba(0,0,0,0.25)] transition sm:size-24 ${
                  i === active ? "ring-2 ring-accent" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
