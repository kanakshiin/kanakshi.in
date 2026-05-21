"use client";

import { Product } from "../lib/types";
import { useCart } from "./cart-provider";
import { CartQuantityControl } from "./cart-quantity-control";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className = "product-card-action", label = "Add To Cart" }: AddToCartButtonProps) {
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.slug);

  if (quantity > 0) {
    return <CartQuantityControl slug={product.slug} className="product-card-quantity-wrap" compact />;
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(product, 1);
      }}
    >
      {label}
    </button>
  );
}
