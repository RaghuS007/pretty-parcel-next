export const runtime = "edge";
import { NextResponse } from "next/server";
import { sendOtp, rateLimit } from "@/lib/store";

export async function POST(req: Request) {
  const { mobile } = await req.json().catch(() => ({}));
  if (!/^[6-9]\d{9}$/.test(mobile || ""))
    return NextResponse.json({ ok: false, error: "Enter a valid 10-digit mobile number" }, { status: 400 });
  if (!rateLimit("otp:" + mobile, 3, 10 * 60_000))
    return NextResponse.json({ ok: false, error: "Too many OTP requests — try again in a few minutes" }, { status: 429 });
  const { devOtp } = await sendOtp(mobile);
  return NextResponse.json({ ok: true, ...(devOtp ? { devOtp } : {}) });
}
