"use client";
import Link from "next/link";
import { Product, inr } from "@/lib/catalogue";
import ProductImage from "./ProductImage";
import { addToCart, getWish, toggleWish, toast, useTick } from "@/lib/client-store";

export default function ProductCard({ p }: { p: Product }) {
  useTick();
  const wished = typeof window !== "undefined" && getWish().includes(p.id);
  return (
    <article className="card">
      <Link className="ph" href={`/product/${p.id}`}>
        <ProductImage p={p} />
        {p.bestseller ? <span className="chip flag">Bestseller</span>
          : p.isNew ? <span className="chip outline flag" style={{ background: "#fff" }}>New</span> : null}
      </Link>
      <button className={`wish ${wished ? "on" : ""}`} aria-label={`Add ${p.name} to wishlist`}
        onClick={() => { toggleWish(p.id); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.5 2.2 4.6 5.9 4.1c2-.3 4 .7 6.1 3 2.1-2.3 4.1-3.3 6.1-3 3.7.5 5.5 4.4 3.9 7.6C19.5 16.1 12 21 12 21z"/></svg>
      </button>
      <div className="card-body">
        <span className="cat">{p.sub}</span>
        <h3><Link href={`/product/${p.id}`}>{p.name}</Link></h3>
        <div className="price">{inr(p.pricePaise)} <s>{inr(p.mrpPaise)}</s></div>
        <div className="card-actions">
          <button className="btn btn-primary btn-sm"
            onClick={() => { addToCart(p.id); toast(p.name + " added to cart"); }}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}
