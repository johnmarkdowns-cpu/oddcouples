import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odd Couples",
  description: "What movie do these two images remind you of?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 font-sans">
        <header className="border-b border-gray-100">
          <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight text-lg">
              Odd Couples
            </a>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/" className="hover:text-gray-900 transition-colors">
                Play
              </a>
              <a href="/explore" className="hover:text-gray-900 transition-colors">
                Explore
              </a>
            </div>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
