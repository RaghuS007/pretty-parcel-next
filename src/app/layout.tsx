import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Pretty Parcel by Neems — Premium Jewellery & Hair Accessories",
  description: "Curated demi-fine jewellery, traditional & oxidised pieces and hair accessories. Wrapped with love in Bengaluru, delivered across India."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
