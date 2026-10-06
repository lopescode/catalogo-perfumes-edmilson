"use client";

import { Minus, Plus } from "./Icons";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  size = "md",
}: {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  size?: "sm" | "md";
}) {
  const dot = size === "sm" ? "size-8 text-sm" : "size-11 text-base";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid size-9 place-items-center rounded-full transition hover:bg-blush disabled:opacity-30"
        aria-label="Diminuir quantidade"
      >
        <Minus />
      </button>
      <span className={`grid place-items-center rounded-full bg-wine font-medium text-white ${dot}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid size-9 place-items-center rounded-full transition hover:bg-blush"
        aria-label="Aumentar quantidade"
      >
        <Plus />
      </button>
    </div>
  );
}
