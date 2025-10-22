import { FilterFn } from "./types";

export class DefaultFilters {
  static upper(v: any): string {
    return v == null ? "" : String(v).toUpperCase();
  }

  static lower(v: any): string {
    return v == null ? "" : String(v).toLowerCase();
  }

  static truncate(v: any, len = 50): string {
    if (v == null) return "";
    const s = String(v);
    const n = Number(len) || 50;
    return s.length > n ? s.slice(0, n) + "…" : s;
  }

  static formatDate(v: any, locale = "en-US"): string {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  }

  static formatUSD(v: any): string {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  }

  static getAll(): Record<string, FilterFn> {
    return {
      upper: this.upper,
      lower: this.lower,
      truncate: this.truncate,
      formatDate: this.formatDate,
      formatUSD: this.formatUSD,
    };
  }
}
