"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import RibbonDivider from "@/components/RibbonDivider";
import { byId, inr, COUPONS, FREE_SHIPPING_THRESHOLD_PAISE, SHIPPING_FLAT_PAISE, Product } from "@/lib/catalogue";
import { getCart, setCart, getWish, getCoupon, setCoupon, toast, useTick, useUser } from "@/lib/client-store";

export default function CartPage() {
  useTick();
  const router = useRouter();
  const { user } = useUser();
  const [recs, setRecs] = useState<Product[]>([]);
  const [code, setCode] = useState("");
  const [placing, setPlacing] = useState(false);

  const cart = typeof window !== "undefined" ? getCart() : {};
  const ids = Object.keys(cart).filter(id => byId(id));
  const applied = typeof window !== "undefined" ? getCoupon() : null;

  useEffect(() => { setCode(applied || ""); }, [applied]);
  useEffect(() => {
    if (!ids.length) { setRecs([]); return; }
    fetch("/api/recommendations/complete-look", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartIds: ids, excludeIds: getWish() })
    }).then(r => r.json()).then(d => setRecs(d.products || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ids)]);

  const subtotal = ids.reduce((s, id) => s + byId(id)!.pricePaise * cart[id], 0);
  const c = applied ? COUPONS[applied] : null;
  const couponBelowMin = !!(c && c.minPaise && subtotal < c.minPaise);
  const discount = c && !couponBelowMin ? (c.type === "pct" ? Math.round(subtotal * c.value / 100) : c.value) : 0;
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : SHIPPING_FLAT_PAISE;
  const total = subtotal - discount + shipping;

  const changeQty = (id: string, d: number) => {
    const cc = getCart(); cc[id] = Math.max(1, (cc[id] || 1) + d); setCart(cc);
  };
  const remove = (id: string) => { const cc = getCart(); delete cc[id]; setCart(cc); toast("Removed from cart"); };
  const apply = () => {
    const k = code.trim().toUpperCase();
    if (!k) { setCoupon(null); return; }
    if (COUPONS[k]) { setCoupon(k); toast("Coupon applied ✓"); }
    else toast("Hmm, that code isn't valid");
  };

  const checkout = async () => {
    if (!user) { toast("Please log in to check out"); setTimeout(() => router.push("/login?next=/cart"), 800); return; }
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: ids.map(id => ({ id, qty: cart[id] })), couponCode: applied })
    });
    const d = await res.json();
    setPlacing(false);
    if (!res.ok) { toast(d.error || "Something went wrong"); return; }
    setCart({}); setCoupon(null);
    toast("Order placed — thank you! ♡");
    setTimeout(() => router.push("/account#orders"), 1200);
  };

  return (<>
    <Header />
    <main className="page"><div className="wrap">
      <div className="crumbs"><Link href="/">Home</Link><span>›</span>Cart</div>

      {!ids.length ? (
        <div className="empty">
          <div className="big">Your parcel is empty</div>
          <p>Beautiful things are waiting — start with our best sellers.</p>
          <p style={{ marginTop: 18 }}><Link className="btn btn-primary" href="/shop">Continue shopping</Link></p>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <h1 className="display" style={{ fontSize: 32, marginBottom: 18 }}>
              Your Parcel <span style={{ fontSize: 16, color: "var(--ink-soft)", fontFamily: "var(--font-body)" }}>
                ({ids.length} item{ids.length > 1 ? "s" : ""})</span></h1>
            {ids.map(id => { const p = byId(id)!; return (
              <div className="cart-item" key={id}>
                <Link className="ph" href={`/product/${p.id}`}><ProductImage p={p} /></Link>
                <div>
                  <span className="cat">{p.sub}</span>
                  <h3><Link href={`/product/${p.id}`}>{p.name}</Link></h3>
                  <div className="qty">
                    <button aria-label="Decrease quantity" onClick={() => changeQty(id, -1)}>−</button>
                    <span>{cart[id]}</span>
                    <button aria-label="Increase quantity" onClick={() => changeQty(id, 1)}>+</button>
                  </div>
                  <div><button className="remove-link" onClick={() => remove(id)}>Remove</button></div>
                </div>
                <div style={{ fontWeight: 600 }}>{inr(p.pricePaise * cart[id])}</div>
              </div>
            ); })}
          </div>

          <aside className="summary">
            <h3>Order Summary</h3>
            <div className="coupon-row">
              <input placeholder="Coupon code" aria-label="Coupon code" value={code}
                onChange={e => setCode(e.target.value)} />
              <button className="btn btn-ghost btn-sm" onClick={apply}>Apply</button>
            </div>
            {applied && couponBelowMin && <p className="coupon-msg err">{applied}: needs a minimum of {inr(c!.minPaise!)}</p>}
            {applied && !couponBelowMin && c && <p className="coupon-msg ok">{applied} applied — {c.label} ✓</p>}
            <div className="sum-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {discount > 0 && <div className="sum-row"><span>Coupon discount</span>
              <span style={{ color: "#2E7D52" }}>− {inr(discount)}</span></div>}
            <div className="sum-row"><span>Shipping</span><span>{shipping ? inr(shipping) : "Free ✓"}</span></div>
            {shipping > 0 && <div className="sum-row" style={{ fontSize: 12, color: "var(--rose-deep)" }}>
              <span>Add {inr(FREE_SHIPPING_THRESHOLD_PAISE - (subtotal - discount))} more for free shipping</span><span /></div>}
            <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}
              onClick={checkout} disabled={placing}>{placing ? "Placing order…" : "Proceed to Checkout"}</button>
            <div className="pay-methods">
              {["UPI","GPay","PhonePe","Paytm","Visa","Mastercard","RuPay","Net Banking"].map(m => <span key={m}>{m}</span>)}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 12 }}>
              🔒 100% secure payments · Gift-wrapped free · COD available</p>
          </aside>
        </div>
      )}

      {recs.length > 0 && (
        <section className="block">
          <div className="section-head"><span className="eyebrow">Goes beautifully with your cart</span>
            <h2>Complete the Look</h2></div>
          <RibbonDivider />
          <div className="scroll-row">{recs.map(r => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div></main>
    <Footer />
  </>);
}
