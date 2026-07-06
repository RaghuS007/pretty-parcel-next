export const runtime = "edge";
import { NextResponse } from "next/server";
import { getSession, getOrders, addOrder } from "@/lib/store";
import { byId, COUPONS, FREE_SHIPPING_THRESHOLD_PAISE, SHIPPING_FLAT_PAISE } from "@/lib/catalogue";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ orders: [] });
  return NextResponse.json({ orders: getOrders(s.mobile) });
}
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { items = [], couponCode = null } = await req.json().catch(() => ({}));
  const valid = (items as { id: string; qty: number }[])
    .map(i => ({ p: byId(i.id), qty: Math.max(1, Math.min(10, Number(i.qty) || 1)) }))
    .filter(i => i.p);
  if (!valid.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const subtotal = valid.reduce((t, i) => t + i.p!.pricePaise * i.qty, 0);
  let discount = 0;
  const c = couponCode ? COUPONS[String(couponCode).toUpperCase()] : null;
  if (c && subtotal >= (c.minPaise || 0))
    discount = c.type === "pct" ? Math.round(subtotal * c.value / 100) : c.value;
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : SHIPPING_FLAT_PAISE;

  const order = {
    orderNumber: "TPP" + String(Math.floor(100000 + Math.random() * 900000)),
    mobile: s.mobile,
    createdAt: new Date().toISOString(),
    status: "processing",
    items: valid.map(i => ({ id: i.p!.id, qty: i.qty, unitPricePaise: i.p!.pricePaise })),
    subtotalPaise: subtotal, discountPaise: discount, shippingPaise: shipping,
    totalPaise: subtotal - discount + shipping,
    couponCode: c ? String(couponCode).toUpperCase() : null
  };
  addOrder(s.mobile, order);
  return NextResponse.json({ ok: true, order });
}
