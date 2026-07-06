"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import RibbonDivider from "@/components/RibbonDivider";
import { byId, CATEGORIES, inr, Product } from "@/lib/catalogue";
import { addToCart, getWish, toggleWish, trackGuestView, toast, useTick, useUser } from "@/lib/client-store";

const REVIEWS: [string, string][] = [
  ["Exactly like the pictures — the finish is gorgeous and it hasn't tarnished at all.", "Ananya"],
  ["The packaging alone is worth it. Felt like receiving a gift from a friend.", "Divya"],
  ["Lightweight and so comfortable, I forgot I was wearing it all day.", "Ritika"]
];

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  useTick();
  const { user } = useUser();
  const { id } = await params;
  const p = byId(id);
  const [img, setImg] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!p) return;
    trackGuestView(p.id);                                      // guest history (localStorage)
    if (user) fetch("/api/recently-viewed", {                  // server history when logged in
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id })
    });
    fetch(`/api/products/${p.id}/related`).then(r => r.json())
      .then(d => setRelated(d.products || []));
  }, [p, user]);

  if (!p) return (<><Header /><main className="page wrap">
    <div className="empty"><div className="big">Product not found</div>
      <p><Link className="btn btn-primary" href="/shop">Back to shop</Link></p></div>
  </main><Footer /></>);

  const wished = typeof window !== "undefined" && getWish().includes(p.id);
  const off = Math.round((1 - p.pricePaise / p.mrpPaise) * 100);

  return (<>
    <Header />
    <main className="page">
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link><span>›</span>
          <Link href={`/shop?cat=${p.cat}`}>{CATEGORIES[p.cat]}</Link><span>›</span>{p.name}
        </div>

        <div className="pdp">
          <div>
            <div className="gallery-main"><ProductImage p={p} variant={img} /></div>
            <div className="gallery-thumbs">
              {[0, 1, 2, 3].map(i => (
                <button key={i} className={i === img ? "on" : ""} aria-label={`View image ${i + 1}`}
                  onClick={() => setImg(i)}><ProductImage p={p} variant={i} /></button>
              ))}
            </div>
          </div>
          <div className="pdp-info">
            <span className="cat">{p.sub} · {p.collection} Collection</span>
            <h1>{p.name}</h1>
            <div className="rating">{"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))}
              <span>{p.rating} · {p.reviews} reviews</span></div>
            <div className="pdp-price">{inr(p.pricePaise)} <s>{inr(p.mrpPaise)}</s>
              <span className="chip" style={{ verticalAlign: "middle", marginLeft: 8 }}>{off}% off</span></div>
            <p className="pdp-desc">A {p.collection} piece in {p.material.toLowerCase()} — finished by hand, quality-checked twice, and wrapped in our signature peach parcel with a handwritten note.</p>
            <div className="pdp-cta">
              <button className="btn btn-primary" onClick={() => { addToCart(p.id); toast(p.name + " added to cart"); }}>Add to cart</button>
              <button className={`btn btn-outline ${wished ? "on" : ""}`}
                onClick={() => { toggleWish(p.id); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}>
                ♡ Wishlist</button>
            </div>
            <div className="accordion">
              <details open><summary>Description</summary>
                <div className="acc-body">Designed in Bengaluru as part of the {p.collection} collection. Lightweight, skin-friendly and made for both festive evenings and everyday wear.</div></details>
              <details><summary>Material</summary><div className="acc-body">{p.material}. Hypoallergenic and nickel-safe.</div></details>
              <details><summary>Care instructions</summary>
                <div className="acc-body">Keep away from perfume, water and sweat. Wipe gently with the soft pouch cloth included in your parcel, and store in the box provided.</div></details>
              <details><summary>Shipping &amp; returns</summary>
                <div className="acc-body">Ships in 24–48 hours from Bengaluru. Free shipping over ₹999. Easy 7-day exchange for damaged items.</div></details>
            </div>
            <div className="trust-row">
              <span>✦ Skin-friendly plating</span><span>✦ Gift-wrapped free</span><span>✦ COD available</span>
            </div>
          </div>
        </div>

        <section className="reviews">
          <div className="section-head" style={{ textAlign: "left" }}>
            <span className="eyebrow">What customers say</span><h2 style={{ fontSize: 26 }}>Reviews</h2></div>
          <div style={{ marginTop: 16 }}>
            {REVIEWS.map(([body, who]) => (
              <div className="review" key={who}>
                <div className="stars">★★★★★</div><p>&ldquo;{body}&rdquo;</p>
                <div className="who">{who} · Verified buyer</div>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="block">
            <div className="section-head"><span className="eyebrow">Curated for you</span><h2>You may also love</h2></div>
            <RibbonDivider />
            <div className="scroll-row">{related.map(r => <ProductCard key={r.id} p={r} />)}</div>
          </section>
        )}
      </div>
    </main>
    <Footer />
  </>);
}
