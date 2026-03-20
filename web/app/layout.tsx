import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import TopNav from "./components/TopNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StudyComply — Mobilité internationale simplifiée",
  description: "Gérez vos documents, suivez vos deadlines et partez étudier à l'étranger l'esprit tranquille.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 antialiased" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <TopNav />
        <main className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
