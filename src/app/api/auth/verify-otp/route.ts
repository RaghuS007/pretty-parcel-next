import { NextResponse } from "next/server";
import { verifyOtp, upsertUser, mergeViews, createSessionCookie, rateLimit } from "@/lib/store";

export async function POST(req: Request) {
  const { name, mobile, otp, guestViews = [] } = await req.json().catch(() => ({}));
  if (!name || String(name).trim().length < 2)
    return NextResponse.json({ ok: false, error: "Please enter your full name" }, { status: 400 });
  if (!/^[6-9]\d{9}$/.test(mobile || ""))
    return NextResponse.json({ ok: false, error: "Invalid mobile number" }, { status: 400 });
  if (!rateLimit("verify:" + mobile, 10, 10 * 60_000))
    return NextResponse.json({ ok: false, error: "Too many attempts — request a new OTP" }, { status: 429 });

  const v = await verifyOtp(mobile, String(otp || ""));
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 401 });

  const { isNew } = upsertUser(mobile);
  const mergedCount = Array.isArray(guestViews) && guestViews.length
    ? mergeViews(mobile, guestViews.slice(0, 20)) : 0;

  const sessionValue = await createSessionCookie({ name: String(name).trim(), mobile });
  const res = NextResponse.json({ ok: true, isNew, mergedCount, user: { name, mobile } });
  res.cookies.set("tpp_session", sessionValue, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30
  });
  return res;
}
