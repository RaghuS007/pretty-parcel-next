import { NextResponse } from "next/server";
import { getSession } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ user: await getSession() });
}
