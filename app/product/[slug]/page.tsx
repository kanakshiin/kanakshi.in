import { notFound, redirect } from "next/navigation";

import { getProduct } from "../../../lib/api";
import { getProductPath } from "../../../lib/site";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.category_slug) {
    notFound();
  }

  redirect(getProductPath(product));
}
