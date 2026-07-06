"use client";
/** Client-side state: cart, wishlist, guest Recently-Viewed (localStorage).
 *  A custom "tpp" event keeps header badges and pages in sync. */
import { useEffect, useState, useCallback } from "react";

const get = <T,>(k: string, d: T): T => {
  if (typeof window === "undefined") return d;
  try { return JSON.parse(localStorage.getItem("tpp_" + k) ?? "") ?? d; } catch { return d; }
};
const set = (k: string, v: unknown) => {
  localStorage.setItem("tpp_" + k, JSON.stringify(v));
  window.dispatchEvent(new Event("tpp"));
};

export type Cart = Record<string, number>;

export const getCart = () => get<Cart>("cart", {});
export const setCart = (c: Cart) => set("cart", c);
export const addToCart = (id: string, qty = 1) => {
  const c = getCart(); c[id] = (c[id] || 0) + qty; setCart(c);
};
export const getWish = () => get<string[]>("wishlist", []);
export const toggleWish = (id: string) => {
  const w = getWish();
  set("wishlist", w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
};

/* Guest recently-viewed — 20-item FIFO (PRD §7) */
export const getGuestViews = () => get<string[]>("rv_guest", []);
export const trackGuestView = (id: string) => {
  const list = getGuestViews().filter(x => x !== id);
  list.unshift(id);
  set("rv_guest", list.slice(0, 20));
};
export const clearGuestViews = () => set("rv_guest", []);

export const getCoupon = () => get<string | null>("coupon", null);
export const setCoupon = (c: string | null) => set("coupon", c);

/** Re-render on any client-store change */
export function useTick() {
  const [, setN] = useState(0);
  useEffect(() => {
    const h = () => setN(n => n + 1);
    window.addEventListener("tpp", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("tpp", h); window.removeEventListener("storage", h); };
  }, []);
}

/** Session user, fetched from /api/auth/me */
export function useUser() {
  const [user, setUser] = useState<{ name: string; mobile: string } | null | undefined>(undefined);
  const refresh = useCallback(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user)).catch(() => setUser(null));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { user, refresh };
}

/* toast */
export function toast(msg: string) {
  let t = document.querySelector(".toast") as HTMLElement | null;
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout((t as any)._timer);
  (t as any)._timer = setTimeout(() => t!.classList.remove("show"), 2200);
}
