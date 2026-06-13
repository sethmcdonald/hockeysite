import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hockey Decision Intelligence",
  description: "Initial scaffold for the hockey decision intelligence platform."
};

const links = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
  { href: "/contracts", label: "Contracts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/anchors-away", label: "Anchors Away" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              Hockey Decision Intelligence
            </Link>
            <nav className="nav" aria-label="Primary navigation">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

