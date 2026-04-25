import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | null | undefined, currency = "ILS") {
  if (amount == null) return "—";
  const symbol = currency === "ILS" ? "₪" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatPct(n: number | null | undefined, digits = 1) {
  if (n == null || isNaN(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function formatNumber(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString();
}
