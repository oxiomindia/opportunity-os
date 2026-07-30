import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // No `template` here: every page in this app already includes "Oxiom" in
  // its own title, so a template would double-brand every tab/SERP snippet
  // (e.g. "Pricing | Oxiom" becoming "Pricing | Oxiom | Oxiom"). Pages that
  // don't set their own title fall back to `default` verbatim.
  title: "Oxiom | Finance Automation Platform for Accounts Payable & Receivable",
  description: "Oxiom is a finance automation platform for growing businesses — Accounts Payable, Accounts Receivable, and Finance Suite, built on one secure workspace.",
  metadataBase: new URL("https://oxiom.in"),
  // Deliberately no site-wide `alternates.canonical` here: a global canonical
  // would tell search engines every page is a duplicate of the homepage.
  // Each public page sets its own via lib/seo/metadata.ts's buildMetadata().
  keywords: [
    "finance automation platform",
    "accounts payable automation",
    "accounts receivable automation",
    "AP automation software",
    "AR automation software",
    "invoice processing",
    "vendor invoice processing software",
    "invoice approval workflow",
    "billing and invoicing software",
  ],
  authors: [{ name: "Oxiom" }],
  creator: "Oxiom",
  publisher: "Oxiom",
  robots: "index, follow",

  // Open Graph / Twitter defaults. No `images` here -- the root
  // opengraph-image.tsx/twitter-image.tsx file conventions generate and
  // attach real images automatically instead of pointing at static files
  // that don't exist in this repository.
  openGraph: {
    type: "website",
    url: "https://oxiom.in",
    title: "Oxiom | Finance Automation Platform for Accounts Payable & Receivable",
    description: "Oxiom is a finance automation platform for growing businesses — Accounts Payable, Accounts Receivable, and Finance Suite, built on one secure workspace.",
    siteName: "Oxiom",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oxiom | Finance Automation Platform",
    description: "Accounts Payable, Accounts Receivable, and Finance Suite — built on one secure workspace.",
  },

  // Additional metadata
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>{children}</body>
    </html>
  );
}
