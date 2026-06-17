"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { getPrimaryImage } from "../lib/api";
import { Product } from "../lib/types";

const WISHLIST_STORAGE_KEY = "kanakshi-wishlist";
const WISHLIST_UPDATED_EVENT = "kanakshi-wishlist-updated";

export type WishlistItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string | null;
  categorySlug?: string | null;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  addItem: (product: Product) => void;
  removeItem: (slug: string) => void;
  toggleItem: (product: Product) => void;
  hasItem: (slug: string) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readWishlist());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(WISHLIST_UPDATED_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, sync as EventListener);
    };
  }, []);

  const value = useMemo<WishlistContextValue>(() => {
    const count = items.length;

    return {
      items,
      count,
      addItem(product) {
        const nextItems = [...readWishlist()];
        const index = nextItems.findIndex((item) => item.slug === product.slug);

        if (index === -1) {
          nextItems.push({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.effective_price ?? product.sale_price ?? product.price ?? 0),
            image: getPrimaryImage(product),
            categoryName: product.category_name,
            categorySlug: product.category_slug,
          });
          writeWishlist(nextItems);
          setItems(nextItems);
        }
      },
      removeItem(slug) {
        const nextItems = readWishlist().filter((item) => item.slug !== slug);
        writeWishlist(nextItems);
        setItems(nextItems);
      },
      toggleItem(product) {
        const currentList = readWishlist();
        const index = currentList.findIndex((item) => item.slug === product.slug);
        
        let nextItems: WishlistItem[];
        if (index >= 0) {
          nextItems = currentList.filter((item) => item.slug !== product.slug);
        } else {
          nextItems = [
            ...currentList,
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.effective_price ?? product.sale_price ?? product.price ?? 0),
              image: getPrimaryImage(product),
              categoryName: product.category_name,
              categorySlug: product.category_slug,
            }
          ];
        }
        
        writeWishlist(nextItems);
        setItems(nextItems);
      },
      hasItem(slug) {
        return items.some((item) => item.slug === slug);
      },
      clearWishlist() {
        writeWishlist([]);
        setItems([]);
      },
    };
  }, [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
