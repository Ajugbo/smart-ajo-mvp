import type { Metadata } from "next";
import { SessionProvider } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Ajo",
  description: "Contribution Circles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background font-sans">
        <SessionProvider>
          <Navbar />
          <main className="container mx-auto max-w-7xl py-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
