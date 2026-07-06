"use client";
import Link from "next/link";
import { useState } from "react";
import { getCart, getWish, useTick, useUser } from "@/lib/client-store";

export default function Header() {
  useTick();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const cartCount = typeof window !== "undefined"
    ? Object.values(getCart()).reduce((a, b) => a + b, 0) : 0;
  const wishCount = typeof window !== "undefined" ? getWish().length : 0;

  return (<>
    <div className="topbar">Free shipping on orders over ₹999 · Wrapped with love in Bengaluru</div>
    <header className="site"><nav className="nav">
      <button className="icon-btn hamburger" aria-label="Menu" onClick={() => setOpen(o => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <Link className="brand" href="/">The Pretty Parcel<small>by Neems</small></Link>
      <div className={`nav-links ${open ? "open" : ""}`}>
        <Link href="/">Home</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/shop?cat=demi-fine">Demi-Fine</Link>
        <Link href="/shop?cat=oxidised">Oxidised</Link>
        <Link href="/shop?cat=hair">Hair Accessories</Link>
        <Link href="/admin">Admin</Link>
      </div>
      <div className="nav-icons">
        <Link className="icon-btn" href={user ? "/account" : "/login"} aria-label="Account"
          title={user ? "Hi, " + user.name.split(" ")[0] : "Login"}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
        </Link>
        <Link className="icon-btn" href="/account#wishlist" aria-label="Wishlist">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.5 2.2 4.6 5.9 4.1c2-.3 4 .7 6.1 3 2.1-2.3 4.1-3.3 6.1-3 3.7.5 5.5 4.4 3.9 7.6C19.5 16.1 12 21 12 21z"/></svg>
          {wishCount > 0 && <span className="count">{wishCount}</span>}
        </Link>
        <Link className="icon-btn" href="/cart" aria-label="Cart">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12l1.5 13h-15z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>
          {cartCount > 0 && <span className="count">{cartCount}</span>}
        </Link>
      </div>
    </nav></header>
  </>);
}
