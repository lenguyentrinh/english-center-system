import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, type Category } from "./categoryApi.ts";

export const CATEGORIES_KEY = ["categories"] as const;
const NONE: Category[] = [];

/** Suggested swatches in the admin color picker; any #rrggbb is accepted. */
export const COLOR_SWATCHES = ["#2563eb", "#0891b2", "#059669", "#f59e0b", "#ea580c", "#e11d48", "#64748b", "#0f172a"];
export const NEUTRAL_COLOR = "#64748b";

function mix(hex: string, to: number, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (to - c) * amount));
  return `rgb(${ch.join(",")})`;
}

/** bg (light tint), fg (dark text) and solid (dot/bar) for a category color. */
export function categoryColors(color?: string | null): { bg: string; fg: string; solid: string } {
  const solid = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : NEUTRAL_COLOR;
  return { solid, bg: mix(solid, 255, 0.88), fg: mix(solid, 0, 0.45) };
}

export function useCategories() {
  const query = useQuery({ queryKey: CATEGORIES_KEY, queryFn: getCategories, staleTime: 60_000 });
  const categories = query.data ?? NONE;
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  return {
    categories,
    isLoading: query.isLoading,
    categoryById: (id?: string | null) => (id ? byId.get(id) : undefined),
  };
}
