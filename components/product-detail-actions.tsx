"use client";

import { useRouter } from "next/navigation";

import { Product } from "../lib/types";
import { CartQuantityControl } from "./cart-quantity-control";
import { useCart } from "./cart-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.slug);

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
      {quantity > 0 ? (
        <CartQuantityControl slug={product.slug} className="detail-quantity-wrap" />
      ) : (
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            addItem(product, 1);
          }}
        >
          Add To Cart
        </button>
      )}
    </div>
  );
}
