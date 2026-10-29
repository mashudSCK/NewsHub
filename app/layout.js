import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { BookmarkProvider } from "@/context/BookmarkContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { getNewsConfig } from "@/lib/news/config";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-sans",
  display: "swap",
});
const newsreader = localFont({
  src: "../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2",
  variable: "--font-editorial",
  display: "swap",
});
export const dynamic = "force-dynamic";
export const metadata = {
  title: { default: "NewsHub — A wider perspective", template: "%s" },
  description:
    "An editorial news reader. Explore headlines, follow your curiosity, and save stories for later.",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F5F0",
};
const initializeTheme = `try{var t=localStorage.getItem('newsTheme');document.documentElement.classList.toggle('dark',t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))}catch(e){document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}`;
export default function RootLayout({ children }) {
  const config = getNewsConfig();
  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());
  const countryNames = {
    us: "United States",
    gb: "United Kingdom",
    ph: "Philippines",
    au: "Australia",
    ca: "Canada",
    in: "India",
  };
  const edition = `${countryNames[config.country] || config.country} / ${config.language.toUpperCase()}`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initializeTheme }} />
      </head>
      <body className={`${inter.variable} ${newsreader.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ThemeProvider>
          <BookmarkProvider>
            <Navbar date={date} edition={edition} />
            {config.mode === "demo" && (
              <div className="container">
                <aside className="demo-notice">
                  <span className="demo-label">Demo edition</span>
                  <span>
                    Illustrative stories and photography. Links open related
                    resources, not reported articles.
                  </span>
                </aside>
              </div>
            )}
            <main id="main" className="container" tabIndex={-1}>
              {children}
            </main>
            <footer className="site-footer container">
              <div className="footer-top">
                <Link href="/" className="footer-wordmark">
                  NewsHub<span>.</span>
                </Link>
                <p>
                  A wider world.
                  <br />A little more understanding.
                </p>
                <Link href="/bookmarks" className="text-link">
                  Your reading list <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="footer-bottom">
                <span>Built for the curious.</span>
                <span>
                  {config.mode === "demo" ? (
                    "Illustrative portfolio demo"
                  ) : (
                    <>
                      News data by{" "}
                      <a
                        href="https://gnews.io"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GNews
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </>
                  )}
                </span>
                <span>© {new Date().getUTCFullYear()} NewsHub</span>
              </div>
            </footer>
          </BookmarkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
