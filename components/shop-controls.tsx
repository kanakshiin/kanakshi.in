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
    <div className="shop-sort-control">
      <select
        value={activeSort}
        onChange={handleSortChange}
        className="shop-sort-select"
        disabled={isPending}
      >
        <option value="popularity">Popularity</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest Arrivals</option>
      </select>
      {isPending && <span className="shop-control-status">updating...</span>}
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

  // Sync state with URL when URL changes directly (e.g. on clear)
  useEffect(() => {
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (minPrice) {
      current.set("min_price", minPrice);
    } else {
      current.delete("min_price");
    }

    if (maxPrice) {
      current.set("max_price", maxPrice);
    } else {
      current.delete("max_price");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    startTransition(() => {
      router.push(`${pathname}${query}`);
    });
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("min_price");
    current.delete("max_price");
    const search = current.toString();
    const query = search ? `?${search}` : "";
    startTransition(() => {
      router.push(`${pathname}${query}`);
    });
  };

  const hasFilter = searchParams.has("min_price") || searchParams.has("max_price");

  return (
    <form onSubmit={handleApplyPrice} className="shop-price-form">
      <div className="shop-price-grid">
        <div className="shop-price-field-group">
          <label htmlFor="min-price" className="shop-field-label">Min Price</label>
          <div className="shop-input-wrapper">
            <span className="shop-input-currency-symbol">₹</span>
            <input
              id="min-price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              min="0"
              className="shop-field-input"
            />
          </div>
        </div>
        <div className="shop-price-field-group">
          <label htmlFor="max-price" className="shop-field-label">Max Price</label>
          <div className="shop-input-wrapper">
            <span className="shop-input-currency-symbol">₹</span>
            <input
              id="max-price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              min="0"
              className="shop-field-input"
            />
          </div>
        </div>
      </div>
      <div className="shop-control-actions">
        <button
          type="submit"
          disabled={isPending}
          className="primary-button shop-action-button"
        >
          Apply Filter
        </button>
        {hasFilter && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="secondary-button shop-action-button"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
