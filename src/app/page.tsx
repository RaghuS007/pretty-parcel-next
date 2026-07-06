"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import RibbonDivider from "@/components/RibbonDivider";
import { PRODUCTS, byId, Product } from "@/lib/catalogue";
import { getGuestViews, clearGuestViews, toast, useUser } from "@/lib/client-store";

function Row({ eyebrow, title, items, tint, children }: {
  eyebrow: string; title: string; items?: Product[]; tint?: boolean; children?: React.ReactNode;
}) {
  return (
    <section className={`block ${tint ? "tint" : ""}`}>
      <div className="wrap">
        <div className="section-head"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
        <RibbonDivider />
        {items && <div className="scroll-row">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>}
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useUser();
  const [rv, setRv] = useState<Product[]>([]);
  const hero = byId("p07")!;

  const loadRV = () => {
    if (user) {
      fetch("/api/recently-viewed").then(r => r.json())
        .then(d => setRv((d.ids || []).map(byId).filter(Boolean) as Product[]));
    } else {
      setRv(getGuestViews().map(byId).filter(Boolean) as Product[]);
    }
  };
  useEffect(loadRV, [user]);

  const clearRV = async () => {
    if (user) await fetch("/api/recently-viewed", { method: "DELETE" });
    clearGuestViews();
    setRv([]); toast("History cleared");
  };

  return (<>
    <Header />
    <main className="page">
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">The Golden Hour Collection</div>
            <h1>Little parcels of <em>everyday elegance</em></h1>
            <p>Demi-fine jewellery, heirloom-inspired oxidised pieces and hair accessories — each one curated with love and wrapped like a gift, even when it&apos;s for you.</p>
            <Link className="btn btn-primary" href="/shop">Shop the Collection</Link>{" "}
            <Link className="btn btn-outline" href="/shop?cat=oxidised" style={{ marginLeft: 10 }}>Oxidised Edit</Link>
          </div>
          <div className="hero-visual">
            <div className="hero-card"><div className="ph"><ProductImage p={hero} /></div></div>
            <div className="gift-note"><div className="to">For you, with love</div><div className="from">— Neems</div></div>
          </div>
        </div>
      </section>

      <Row eyebrow="Just unwrapped" title="New Arrivals" items={PRODUCTS.filter(p => p.isNew)} />
      <Row eyebrow="Loved by everyone" title="Best Sellers" items={PRODUCTS.filter(p => p.bestseller)} tint />

      <Row eyebrow="Explore" title="Featured Collections">
        <div className="band">
          {(["demi-fine", "oxidised", "hair"] as const).map(cat => {
            const sample = PRODUCTS.find(p => p.cat === cat && p.bestseller) || PRODUCTS.find(p => p.cat === cat)!;
            const label = { "demi-fine": "Demi-Fine Jewellery", oxidised: "Traditional & Oxidised", hair: "Hair Accessories" }[cat];
            return (
              <Link key={cat} href={`/shop?cat=${cat}`}>
                <div className="bg"><ProductImage p={sample} variant={1} /></div>
                <span className="band-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </Row>

      <Row eyebrow="Rooted in tradition" title="The Oxidised Edit" items={PRODUCTS.filter(p => p.cat === "oxidised")} tint />
      <Row eyebrow="The finishing touch" title="Hair Accessories" items={PRODUCTS.filter(p => p.cat === "hair")} />

      {rv.length > 0 && (
        <Row eyebrow="Pick up where you left off" title="Recently Viewed" items={rv} tint>
          <p style={{ textAlign: "center", marginTop: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={clearRV}>Clear all</button>
          </p>
        </Row>
      )}

      <Row eyebrow="From our parcel people" title="Kind Words">
        <div className="testis">
          {[
            ["The unboxing felt like a gift to myself. The jhumkas are even prettier in person.", "Ananya · Bengaluru"],
            ["Ordered the claw clip and scrunchie set for my sister — the handwritten note made her day.", "Priyanka · Hyderabad"],
            ["Finally, demi-fine that doesn't tarnish in a month. The layered necklace is my daily go-to.", "Shruti · Mumbai"]
          ].map(([q, who]) => (
            <div className="testi" key={who}>
              <div className="stars">★★★★★</div><p>&ldquo;{q}&rdquo;</p><div className="who">{who}</div>
            </div>
          ))}
        </div>
      </Row>

      <Row eyebrow="@theprettyparcelbyneems" title="On Instagram" tint>
        <div className="insta-grid">
          {PRODUCTS.slice(0, 6).map((p, i) => (
            <Link key={p.id} href={`/product/${p.id}`} aria-label={p.name}><ProductImage p={p} variant={i % 3} /></Link>
          ))}
        </div>
      </Row>

      <section className="block"><div className="wrap">
        <div className="newsletter">
          <h2>Join the parcel list</h2>
          <p>New collections, restocks and little surprises — straight to your inbox. No noise, we promise.</p>
          <form onSubmit={e => { e.preventDefault(); toast("Welcome to the parcel list ♡"); (e.target as HTMLFormElement).reset(); }}>
            <input type="email" placeholder="Your email address" required aria-label="Email address" />
            <button className="btn btn-primary" type="submit">Subscribe</button>
          </form>
        </div>
      </div></section>
    </main>
    <Footer />
  </>);
}
