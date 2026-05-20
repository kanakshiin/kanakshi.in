"use client";

import { useRouter } from "next/navigation";

import { Product } from "../lib/types";
import { useCart } from "./cart-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <div className="hero-actions">
      <button
        type="button"
        className="primary-button"
        onClick={() => {
          addItem(product, 1);
          router.push("/cart");
        }}
      >
        Buy Now
      </button>
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          addItem(product, 1);
        }}
      >
        Add To Cart
      </button>
    </div>
  );
}
