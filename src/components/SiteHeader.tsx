"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Countdown } from "./Countdown";
import { PreferenceToggles } from "./PreferenceToggles";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/archive", label: "Archive" },
  { href: "/random", label: "Random" },
  { href: "/stats", label: "Stats" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="top">
      <div>
        <p className="brand">
          <Link href="/">Daily Chess</Link>
        </p>
        <Countdown />
      </div>
      <div className="header-tools">
        <nav className="nav">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                (link.href === "/archive"
                  ? pathname === "/archive" || pathname.startsWith("/p/")
                  : link.href === "/random"
                    ? pathname === "/random" || pathname === "/practice"
                    : pathname === link.href)
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <PreferenceToggles />
      </div>
    </header>
  );
}
