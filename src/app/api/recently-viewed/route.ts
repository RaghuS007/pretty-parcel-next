export const runtime = "edge";
import { NextResponse } from "next/server";
import { getSession, getViews, trackViewServer, clearViews } from "@/lib/store";
import { byId } from "@/lib/catalogue";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ ids: [], guest: true });
  return NextResponse.json({ ids: getViews(s.mobile).filter(id => byId(id)) });
}
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ ok: false, guest: true });
  const { productId } = await req.json().catch(() => ({}));
  if (byId(productId)) trackViewServer(s.mobile, productId);
  return NextResponse.json({ ok: true });
}
export async function DELETE() {
  const s = await getSession();
  if (s) clearViews(s.mobile);
  return NextResponse.json({ ok: true });
}
