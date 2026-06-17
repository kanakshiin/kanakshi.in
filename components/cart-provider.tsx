"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { getPrimaryImage } from "../lib/api";
import { Product } from "../lib/types";

const CART_STORAGE_KEY = "kanakshi-cart";
const CART_UPDATED_EVENT = "kanakshi-cart-updated";

export type CartProductInput = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "sale_price" | "effective_price" | "images" | "category_name" | "category_slug" | "is_sellable"
>;

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: CartProductInput, quantity?: number) => void;
  getItemQuantity: (slug: string) => number;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  isAddedModalOpen: boolean;
  lastAddedItem: CartItem | null;
  setAddedModalOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAddedModalOpen, setAddedModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    const sync = () => setItems(readCart());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CART_UPDATED_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CART_UPDATED_EVENT, sync as EventListener);
    };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      count,
      subtotal,
      isAddedModalOpen,
      lastAddedItem,
      setAddedModalOpen,
      addItem(product, quantity = 1) {
        if (product.is_sellable === false) {
          return;
        }

        const nextItems = [...readCart()];
        const index = nextItems.findIndex((item) => item.slug === product.slug);
        const safeQuantity = Math.max(1, quantity);
        let addedItem: CartItem;

        if (index >= 0) {
          nextItems[index] = {
            ...nextItems[index],
            quantity: nextItems[index].quantity + safeQuantity,
          };
          addedItem = nextItems[index];
        } else {
          const newItem = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.effective_price ?? product.sale_price ?? product.price ?? 0),
            image: getPrimaryImage(product),
            categoryName: product.category_name,
            categorySlug: product.category_slug,
            quantity: safeQuantity,
          };
          nextItems.push(newItem);
          addedItem = newItem;
        }

        writeCart(nextItems);
        setItems(nextItems);
        setLastAddedItem(addedItem);
        setAddedModalOpen(true);
      },
      getItemQuantity(slug) {
        return items.find((item) => item.slug === slug)?.quantity ?? 0;
      },
      removeItem(slug) {
        const nextItems = readCart().filter((item) => item.slug !== slug);
        writeCart(nextItems);
        setItems(nextItems);
      },
      updateQuantity(slug, quantity) {
        const nextItems = readCart().map((item) =>
          item.slug === slug ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        writeCart(nextItems);
        setItems(nextItems);
      },
      clearCart() {
        writeCart([]);
        setItems([]);
      },
    };
  }, [items, isAddedModalOpen, lastAddedItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
