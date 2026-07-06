export const runtime = "edge";
import { NextResponse } from "next/server";
import { byId } from "@/lib/catalogue";
import { relatedProducts } from "@/lib/recommend";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const p = byId(id);
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ products: relatedProducts(p, 8) });
}
