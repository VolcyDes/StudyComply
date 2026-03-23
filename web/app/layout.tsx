import "./globals.css";
import type { Metadata } from "next";
import TopNav from "./components/TopNav";
import Providers from "./components/Providers";

export const metadata: Metadata = {
  title: "StudyComply",
  description: "Track documents & requirements for studying abroad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TopNav />
          <main className="mx-auto max-w-5xl px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
