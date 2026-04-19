"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/links", label: "Links" },
];

const TAGLINE = "Data, software, and the craft of things.";

function formatToday(): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

export function Masthead() {
  const pathname = usePathname() ?? "/";
  const today = formatToday();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
      {/* Top strip — date + tagline, desktop only. */}
      <div className="hidden md:block border-b border-border/60">
        <div className="container-editorial flex items-center justify-between py-2">
          <span className="label-eyebrow">
            <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
          </span>
          <span className="label-eyebrow">{TAGLINE}</span>
        </div>
      </div>

      {/* Main row — wordmark left, nav right. */}
      <div className="container-editorial flex items-baseline justify-between py-4">
        <Link
          href="/"
          aria-label="Shreyash Gupta — home"
          data-cursor-intent="hover"
          className="inline-flex items-baseline"
        >
          <span className="display-sm tracking-tight font-medium">
            Shreyash Gupta
          </span>
          <span
            aria-hidden="true"
            className="display-sm font-medium"
            style={{ color: "hsl(var(--accent))" }}
          >
            .
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-5 sm:gap-7">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    data-cursor-intent="hover"
                    aria-current={active ? "page" : undefined}
                    className={[
                      "relative inline-block py-1 text-sm font-medium transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 right-0 -bottom-0.5 h-px bg-foreground"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
