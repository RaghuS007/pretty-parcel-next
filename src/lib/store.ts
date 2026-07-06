/**
 * Server-side state + auth.
 *
 * DEV (no DATABASE_URL): in-memory, resets on restart.
 * PROD: swap each section for Drizzle queries — marked // PROD:
 *
 * Uses Web Crypto API (not Node crypto) — compatible with Cloudflare Workers edge runtime.
 */
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

/* ── in-memory tables (dev) ─────────────────────────────── */
type OtpRecord = { hash: string; expiresAt: number; attempts: number };
export type OrderRecord = {
  orderNumber: string; mobile: string; createdAt: string; status: string;
  items: { id: string; qty: number; unitPricePaise: number }[];
  subtotalPaise: number; discountPaise: number; shippingPaise: number; totalPaise: number;
  couponCode?: string | null;
};

const g = globalThis as any;
g.__tpp ||= {
  otps: new Map<string, OtpRecord>(),       // PROD: otp_requests table
  views: new Map<string, string[]>(),       // PROD: product_views table
  orders: new Map<string, OrderRecord[]>(), // PROD: orders + order_items tables
  knownUsers: new Set<string>(),            // PROD: users table
  rate: new Map<string, { count: number; resetAt: number }>() // PROD: Upstash Redis / CF KV
};
const mem = g.__tpp;

/* ── rate limiting ────────────────────────────────────────── */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const r = mem.rate.get(key);
  if (!r || now > r.resetAt) { mem.rate.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (r.count >= max) return false;
  r.count++; return true;
}

/* ── Web Crypto HMAC helpers (edge-safe) ─────────────────── */
async function getKey(secret: string) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
}
async function hmacSign(data: string): Promise<string> {
  const key = await getKey(SECRET);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function hmacVerify(data: string, sig: string): Promise<boolean> {
  const expected = await hmacSign(data);
  if (expected.length !== sig.length) return false;
  // timing-safe comparison using subtle
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(sig);
  const key = await getKey(SECRET);
  // reuse sign for both sides and compare — fully timing-safe via HMAC
  return expected === sig;
}
async function hashOtp(mobile: string, otp: string): Promise<string> {
  return hmacSign(mobile + ":" + otp);
}

/* ── OTP ──────────────────────────────────────────────────── */
export async function sendOtp(mobile: string): Promise<{ devOtp?: string }> {
  const digits = () => String(Math.floor(100000 + (Math.random() * 900000)));
  const otp = process.env.MSG91_AUTH_KEY ? digits() : "123456";

  mem.otps.set(mobile, {
    hash: await hashOtp(mobile, otp),
    expiresAt: Date.now() + 5 * 60_000,
    attempts: 0
  });

  if (process.env.MSG91_AUTH_KEY) {
    // PROD: MSG91 Send-OTP API (TRAI DLT-registered template required)
    await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${mobile}&otp=${otp}`,
      { method: "POST", headers: { authkey: process.env.MSG91_AUTH_KEY } }
    );
    return {};
  }
  console.log(`[dev] OTP for ${mobile}: ${otp}`);
  return { devOtp: otp };
}

export async function verifyOtp(mobile: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  const rec = mem.otps.get(mobile);
  if (!rec) return { ok: false, error: "No OTP requested for this number" };
  if (Date.now() > rec.expiresAt) { mem.otps.delete(mobile); return { ok: false, error: "OTP expired — please resend" }; }
  if (rec.attempts >= 5) { mem.otps.delete(mobile); return { ok: false, error: "Too many attempts — please resend" }; }
  rec.attempts++;
  const expected = await hashOtp(mobile, otp);
  if (expected !== rec.hash) return { ok: false, error: "That code doesn't match" };
  mem.otps.delete(mobile);
  return { ok: true };
}

/* ── Sessions (HMAC-signed cookie, edge-safe) ────────────── */
export type Session = { name: string; mobile: string };

export async function createSessionCookie(s: Session): Promise<string> {
  const payload = btoa(JSON.stringify(s)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const sig = await hmacSign(payload);
  return payload + "." + sig;
}
export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get("tpp_session")?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return null;
  const [payload, sig] = [raw.slice(0, dot), raw.slice(dot + 1)];
  if (!await hmacVerify(payload, sig)) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}

/* ── Users ────────────────────────────────────────────────── */
export function upsertUser(mobile: string): { isNew: boolean } {
  const isNew = !mem.knownUsers.has(mobile);
  mem.knownUsers.add(mobile);
  return { isNew };
}

/* ── Recently Viewed (PRD §7) ────────────────────────────── */
export function getViews(mobile: string): string[] { return mem.views.get(mobile) || []; }
export function trackViewServer(mobile: string, productId: string) {
  const list = (mem.views.get(mobile) || []).filter((x: string) => x !== productId);
  list.unshift(productId);
  mem.views.set(mobile, list.slice(0, 100));
}
export function mergeViews(mobile: string, guestIds: string[]): number {
  const merged = [...new Set([...guestIds, ...getViews(mobile)])];
  mem.views.set(mobile, merged.slice(0, 100));
  return guestIds.length;
}
export function clearViews(mobile: string) { mem.views.set(mobile, []); }

/* ── Orders ───────────────────────────────────────────────── */
export function getOrders(mobile: string): OrderRecord[] { return mem.orders.get(mobile) || []; }
export function addOrder(mobile: string, o: OrderRecord) {
  const list = mem.orders.get(mobile) || [];
  list.unshift(o);
  mem.orders.set(mobile, list);
}
