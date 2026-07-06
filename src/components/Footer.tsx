import Link from "next/link";

export default function Footer() {
  return (<>
    <footer className="site"><div className="footer-grid">
      <div><h4>The Pretty Parcel by Neems</h4>
        <p style={{ color: "var(--ink-soft)" }}>Curated with Love, Wrapped in Elegance. Premium demi-fine jewellery, traditional pieces and hair accessories from Bengaluru — delivered pan-India.</p></div>
      <div><h4>Shop</h4><ul>
        <li><Link href="/shop?cat=demi-fine">Demi-Fine Jewellery</Link></li>
        <li><Link href="/shop?cat=oxidised">Traditional &amp; Oxidised</Link></li>
        <li><Link href="/shop?cat=hair">Hair Accessories</Link></li>
        <li><Link href="/shop">All Products</Link></li></ul></div>
      <div><h4>Help</h4><ul>
        <li><a href="#">Shipping &amp; Returns</a></li><li><a href="#">Care Guide</a></li>
        <li><a href="#">Privacy Policy</a></li><li><a href="#">Terms &amp; Conditions</a></li></ul></div>
      <div><h4>Get in touch</h4><ul>
        <li>theprettyparcelbyneems@gmail.com</li><li>+91 79753 81312</li>
        <li><a href="#">Instagram</a> · <a href="#">Facebook</a></li></ul></div>
    </div><div className="footnote">© 2026 The Pretty Parcel by Neems · Bengaluru, India</div></footer>
    <a className="wa-float" href="https://wa.me/917975381312" aria-label="Chat on WhatsApp" target="_blank" rel="noopener">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.7.3.2.5.1.7-.1l1-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.3 1.3z"/></svg>
    </a>
  </>);
}
