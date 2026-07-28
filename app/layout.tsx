import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oxiom Invoice Processing | Vendor Invoice & AP Automation",
  description: "Automate vendor invoice processing and Accounts Payable workflows with AI-powered extraction, validation, approval, and audit-ready processing on the Oxiom One platform.",
  metadataBase: new URL("https://oxiom.in"),
  alternates: {
    canonical: "https://oxiom.in",
  },
  keywords: [
    "vendor invoice processing software",
    "invoice processing",
    "accounts payable automation",
    "AP automation software",
    "supplier invoice management",
    "invoice approval workflow",
    "invoice workflow automation",
    "OCR invoice processing",
    "invoice automation",
  ],
  authors: [{ name: "Oxiom" }],
  creator: "Oxiom",
  publisher: "Oxiom",
  robots: "index, follow",
  
  // Open Graph
  openGraph: {
    type: "website",
    url: "https://oxiom.in",
    title: "Oxiom Invoice Processing | Vendor Invoice & AP Automation",
    description: "Automate vendor invoice processing and Accounts Payable workflows with AI-powered extraction, validation, approval, and audit-ready processing.",
    siteName: "Oxiom",
    images: [
      {
        url: "https://oxiom.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oxiom Invoice Processing",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Oxiom Invoice Processing | AP Automation",
    description: "Automate vendor invoice processing and Accounts Payable workflows with AI.",
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
