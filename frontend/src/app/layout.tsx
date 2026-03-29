import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Dobby — AI Job-Hunting Agent",
  description:
    "Your autonomous AI-powered job hunting assistant. Discover, apply, and track jobs automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <Sidebar />
          <main
            style={{
              marginLeft: "var(--sidebar-width)",
              minHeight: "100vh",
              padding: "var(--space-xl)",
              transition: "margin-left 0.2s ease",
            }}
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
