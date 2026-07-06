
import { NextResponse } from "next/server";
import { completeTheLook } from "@/lib/recommend";

/** POST /api/recommendations/complete-look  { cartIds: string[], excludeIds?: string[] } */
export async function POST(req: Request) {
  const { cartIds = [], excludeIds = [] } = await req.json().catch(() => ({}));
  return NextResponse.json({ products: completeTheLook(cartIds, excludeIds, 4) });
}
