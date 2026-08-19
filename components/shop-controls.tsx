"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function ShopSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeSort = searchParams.get("sort") || "popularity";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (e.target.value === "popularity") {
      current.delete("sort");
    } else {
      current.set("sort", e.target.value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    startTransition(() => {
      router.push(`${pathname}${query}`);
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label htmlFor="shop-sort-select" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--kanakshi-text-muted)" }}>
        Sort By:
      </label>
      <div style={{ position: "relative" }}>
        <select
          id="shop-sort-select"
          value={activeSort}
          onChange={handleSortChange}
          disabled={isPending}
          style={{
            padding: "8px 32px 8px 14px",
            fontSize: "0.84rem",
            fontWeight: "600",
            color: "var(--kanakshi-black)",
            backgroundColor: "#ffffff",
            border: "1px solid var(--kanakshi-border-dark)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          <option value="popularity">Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">New Arrivals</option>
        </select>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--kanakshi-text-muted)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

export function ShopPriceFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  const applyRange = (min: string, max: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (min) current.set("min_price", min);
    else current.delete("min_price");
    if (max) current.set("max_price", max);
    else current.delete("max_price");
    const query = current.toString() ? `?${current.toString()}` : "";
    startTransition(() => {
      router.push(`${pathname}${query}`);
    });
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    applyRange(minPrice, maxPrice);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    applyRange("", "");
  };

  const hasFilter = searchParams.has("min_price") || searchParams.has("max_price");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {/* Quick Price Range Chips */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => applyRange("", "1999")}
          className="kanakshi-pdp-pill"
          style={{
            fontSize: "0.78rem",
            padding: "4px 10px",
            backgroundColor: searchParams.get("max_price") === "1999" ? "var(--kanakshi-black)" : "#ffffff",
            color: searchParams.get("max_price") === "1999" ? "#ffffff" : "var(--kanakshi-text-body)",
            borderColor: "var(--kanakshi-border)"
          }}
        >
          Under ₹1,999
        </button>
        <button
          type="button"
          onClick={() => applyRange("1999", "4999")}
          className="kanakshi-pdp-pill"
          style={{
            fontSize: "0.78rem",
            padding: "4px 10px",
            backgroundColor: searchParams.get("min_price") === "1999" && searchParams.get("max_price") === "4999" ? "var(--kanakshi-black)" : "#ffffff",
            color: searchParams.get("min_price") === "1999" && searchParams.get("max_price") === "4999" ? "#ffffff" : "var(--kanakshi-text-body)",
            borderColor: "var(--kanakshi-border)"
          }}
        >
          ₹1,999 - ₹4,999
        </button>
        <button
          type="button"
          onClick={() => applyRange("5000", "")}
          className="kanakshi-pdp-pill"
          style={{
            fontSize: "0.78rem",
            padding: "4px 10px",
            backgroundColor: searchParams.get("min_price") === "5000" ? "var(--kanakshi-black)" : "#ffffff",
            color: searchParams.get("min_price") === "5000" ? "#ffffff" : "var(--kanakshi-text-body)",
            borderColor: "var(--kanakshi-border)"
          }}
        >
          Above ₹5,000
        </button>
      </div>

      {/* Custom Min / Max Inputs */}
      <form onSubmit={handleApplyPrice} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="number"
          placeholder="₹ Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{
            width: "76px",
            padding: "6px 8px",
            fontSize: "0.8rem",
            border: "1px solid var(--kanakshi-border)",
            borderRadius: "var(--radius-sm)",
            outline: "none"
          }}
        />
        <span style={{ fontSize: "0.8rem", color: "var(--kanakshi-text-muted)" }}>-</span>
        <input
          type="number"
          placeholder="₹ Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            width: "76px",
            padding: "6px 8px",
            fontSize: "0.8rem",
            border: "1px solid var(--kanakshi-border)",
            borderRadius: "var(--radius-sm)",
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="kanakshi-btn kanakshi-btn-primary"
          style={{ fontSize: "0.78rem", padding: "0 12px", height: "30px", minHeight: "30px" }}
        >
          Go
        </button>
        {hasFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="kanakshi-btn kanakshi-btn-secondary"
            style={{ fontSize: "0.78rem", padding: "0 10px", height: "30px", minHeight: "30px" }}
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}
