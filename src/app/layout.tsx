import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineMax - Stream Movies & TV Series",
  description:
    "Stream the latest movies, TV series, and anime in premium quality. Discover trending content now.",
  keywords: "movies, streaming, tv series, anime, watch online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="footer">
          <p>© 2026 CineMax. All rights reserved. Powered by MovieBox API.</p>
        </footer>
      </body>
    </html>
  );
}
