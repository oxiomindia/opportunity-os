import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oxiom | AI-Powered Invoice Processing",
  description: "Transform vendor invoices into verified, payment-ready data in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
