import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

type FooterLink = { href: string; label: string; external?: boolean };

const WRITING: FooterLink[] = [
  { href: "/blog", label: "All Writing" },
  { href: "/feed.xml", label: "RSS Feed" },
];

const ELSEWHERE: FooterLink[] = [
  { href: "https://github.com/shreyashguptas", label: "GitHub", external: true },
  { href: "https://x.com/ShreyashGuptas", label: "X (Twitter)", external: true },
  { href: "https://www.youtube.com/@ShreyashGuptas", label: "YouTube", external: true },
  { href: "https://www.printables.com/@shreyashgupta", label: "Printables", external: true },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 md:mt-24 border-t border-border">
      <div className="container-editorial py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand blurb (2 col) */}
          <div className="md:col-span-2 max-w-md">
            <Link href="/" className="inline-flex items-baseline" data-cursor-intent="hover">
              <span className="display-sm font-medium">Shreyash Gupta</span>
              <span
                aria-hidden="true"
                className="display-sm font-medium"
                style={{ color: "hsl(var(--accent))" }}
              >
                .
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Data scientist and software engineer. Writing about tools, software, and
              the hardware I design under OffGrid Devices.
            </p>
          </div>

          <FooterColumn title="Writing" links={WRITING} />
          <FooterColumn title="Elsewhere" links={ELSEWHERE} />
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="tabular text-xs text-muted-foreground">
            © {year}  Shreyash Gupta.  All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="label-eyebrow mb-4">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground hover:text-muted-foreground transition-colors"
                data-cursor-intent="hover"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-foreground hover:text-muted-foreground transition-colors"
                data-cursor-intent="hover"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
