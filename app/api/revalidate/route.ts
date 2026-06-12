import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECRET_FALLBACK = "little-divinity-homepage-revalidate";

function normalizePaths(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return ["/"];
  }

  const paths = input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .map((value) => (value.startsWith("/") ? value : `/${value}`));

  return paths.length ? Array.from(new Set(paths)) : ["/"];
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const secret = body?.secret;
  const expectedSecret = process.env.FRONTEND_REVALIDATE_SECRET || REVALIDATE_SECRET_FALLBACK;

  if (secret !== expectedSecret) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const paths = normalizePaths(body?.paths);

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    revalidated: paths,
    now: new Date().toISOString(),
  });
}
