"use client";

import { useState } from "react";

import { Product } from "../lib/types";
import { useCart } from "./cart-provider";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className = "product-card-action", label = "Add To Cart" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(product, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Added" : label}
    </button>
  );
}
