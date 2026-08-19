import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "../../../lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ products: [], total: 0 });
  }

  try {
    const listResponse = await getProducts(`q=${encodeURIComponent(q)}&per_page=8`);
    let items = listResponse.items || [];

    if (items.length > 0) {
      const qTokens = q.split(/\\s+/).filter(Boolean);
      const filtered = items.filter((item) => {
        const name = (item.name || "").toLowerCase();
        const desc = (item.description || item.short_desc || "").toLowerCase();
        const cat = (item.category_name || item.category_slug || "").toLowerCase();
        const mat = (item.material || "").toLowerCase();

        return qTokens.some(
          (tok) =>
            name.includes(tok) ||
            desc.includes(tok) ||
            cat.includes(tok) ||
            mat.includes(tok)
        );
      });

      if (filtered.length > 0) {
        items = filtered;
      }
    }

    return NextResponse.json({
      products: items.slice(0, 6),
      total: listResponse.pagination?.total || items.length
    });
  } catch (err) {
    console.error("Search API route error:", err);
    return NextResponse.json({ products: [], total: 0 });
  }
}
