import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Construction Company Websites | Specialists in Builder Websites UK",
  description:
    "We specialise in websites for construction companies, builders, and tradesmen. Professional websites + automated social media posting from £99/month.",
  openGraph: {
    title: "Construction Company Websites | BuilderSites",
    description:
      "We specialise in websites for construction companies, builders, and tradesmen. From £99/month.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {/* Header - Minimal */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              BuilderSites
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900">
                Demo
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
