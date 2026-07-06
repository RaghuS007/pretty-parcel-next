import { Product, PALETTES } from "@/lib/catalogue";

const ICONS: Record<string, string> = {
  necklace: '<path d="M25 30 Q60 78 95 30" fill="none" stroke-width="2.5"/><circle cx="60" cy="80" r="7" fill="none" stroke-width="2.5"/>',
  earring: '<circle cx="45" cy="38" r="5" fill="none" stroke-width="2.5"/><path d="M45 43 q-8 18 0 26 q10 8 0 14" fill="none" stroke-width="2.5"/><circle cx="75" cy="38" r="5" fill="none" stroke-width="2.5"/><path d="M75 43 q8 18 0 26 q-10 8 0 14" fill="none" stroke-width="2.5"/>',
  jhumka: '<circle cx="60" cy="35" r="5" fill="none" stroke-width="2.5"/><path d="M45 55 a15 15 0 0 1 30 0 l-4 22 h-22 z" fill="none" stroke-width="2.5"/><circle cx="52" cy="84" r="2.5"/><circle cx="60" cy="86" r="2.5"/><circle cx="68" cy="84" r="2.5"/>',
  bracelet: '<ellipse cx="60" cy="60" rx="30" ry="24" fill="none" stroke-width="2.5" stroke-dasharray="6 5"/>',
  ring: '<circle cx="60" cy="64" r="20" fill="none" stroke-width="2.5"/><path d="M52 44 l8 -10 8 10 z" fill="none" stroke-width="2.5"/>',
  anklet: '<path d="M28 60 q32 26 64 0" fill="none" stroke-width="2.5" stroke-dasharray="2 6"/><circle cx="60" cy="73" r="4" fill="none" stroke-width="2.5"/>',
  set: '<path d="M35 32 Q60 62 85 32" fill="none" stroke-width="2.5"/><circle cx="42" cy="80" r="9" fill="none" stroke-width="2.5"/><circle cx="78" cy="80" r="9" fill="none" stroke-width="2.5"/>',
  pendant: '<path d="M40 28 Q60 48 80 28" fill="none" stroke-width="2.5"/><circle cx="60" cy="58" r="14" fill="none" stroke-width="2.5"/><circle cx="60" cy="58" r="5" fill="none" stroke-width="2"/>',
  bangle: '<circle cx="60" cy="60" r="27" fill="none" stroke-width="2.5"/><circle cx="60" cy="60" r="20" fill="none" stroke-width="2"/>',
  claw: '<path d="M35 55 q25 -30 50 0" fill="none" stroke-width="2.5"/><path d="M38 55 v14 M46 58 v16 M54 60 v18 M62 60 v18 M70 58 v16 M78 55 v14" stroke-width="2.5"/>',
  clip: '<path d="M32 66 l40 -22 a8 8 0 0 1 8 14 l-40 22 z" fill="none" stroke-width="2.5"/><circle cx="72" cy="50" r="3"/>',
  band: '<path d="M30 82 a34 34 0 0 1 60 0" fill="none" stroke-width="6" stroke-linecap="round"/>',
  scrunchie: '<circle cx="60" cy="60" r="24" fill="none" stroke-width="9" stroke-linecap="round" stroke-dasharray="10 7"/>',
  bow: '<path d="M60 60 L30 42 q-6 18 0 36 z M60 60 L90 42 q6 18 0 36 z" fill="none" stroke-width="2.5"/><rect x="54" y="54" width="12" height="12" rx="3" fill="none" stroke-width="2.5"/>'
};

/** SVG placeholder "photography" — swap for <Image> from your CDN when shots are ready */
export default function ProductImage({ p, variant = 0 }: { p: Product; variant?: number }) {
  const [c1, c2] = PALETTES[p.cat];
  const shift = variant * 12;
  const gid = `g${p.id}${variant}`;
  const svg = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="120" height="120" fill="url(#${gid})"/>
    <circle cx="${95 - shift}" cy="${22 + shift}" r="30" fill="rgba(255,255,255,.25)"/>
    <g stroke="#2C2C2A" fill="#2C2C2A" transform="rotate(${variant * 6} 60 60)">${ICONS[p.icon] || ICONS.set}</g>
  </svg>`;
  return <span style={{ display: "block", width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
