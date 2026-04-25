import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paidads",
  description: "All-in-one ads, SEO, CRO, socials, emails, taxes, and ecom-builder control panel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
