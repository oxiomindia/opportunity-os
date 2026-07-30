import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Oxiom | Finance Automation Platform for Accounts Payable & Receivable",
    template: "%s | Oxiom",
  },
  description: "Oxiom is a finance automation platform for growing businesses — Accounts Payable, Accounts Receivable, and Finance Suite, built on one secure workspace.",
  metadataBase: new URL("https://oxiom.in"),
  alternates: {
    canonical: "https://oxiom.in",
  },
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

  // Open Graph
  openGraph: {
    type: "website",
    url: "https://oxiom.in",
    title: "Oxiom | Finance Automation Platform for Accounts Payable & Receivable",
    description: "Oxiom is a finance automation platform for growing businesses — Accounts Payable, Accounts Receivable, and Finance Suite, built on one secure workspace.",
    siteName: "Oxiom",
    images: [
      {
        url: "https://oxiom.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oxiom Finance Automation Platform",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Oxiom | Finance Automation Platform",
    description: "Accounts Payable, Accounts Receivable, and Finance Suite — built on one secure workspace.",
    images: ["https://oxiom.in/twitter-image.png"],
    creator: "@oxiom",
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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>{children}</body>
    </html>
  );
}
