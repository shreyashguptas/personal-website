import Container from "@/app/_components/container";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

// ─── Customize these URLs ────────────────────────────────────────────────────
// TODO: Replace placeholder values with your real URLs before publishing.
const LINKS = {
  offgridDevices: {
    site:   "https://offgriddevices.com",              // TODO: verify domain
    etsy:   "https://www.etsy.com/shop/OffGridDevices", // TODO: replace with real Etsy shop URL
    amazon: "https://www.amazon.com/s?k=offgrid+devices", // TODO: replace with your Amazon storefront URL
  },
  content: {
    youtube:    "https://www.youtube.com/@ShreyashGuptas",
    printables: "https://www.printables.com/@ShreyashGuptas", // TODO: verify Printables handle
    twitter:    "https://x.com/ShreyashGuptas",
  },
  partnerships: {
    shapr3d: "https://www.shapr3d.com",               // TODO: replace with your creator/affiliate link
  },
  personal: {
    site:      "https://shreyashg.com",
    startHere: "https://shreyashg.com",               // TODO: point to an /about or /start-here page if you have one
  },
} as const;
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Links | Shreyash Gupta",
  description:
    "OffGrid Devices shop, YouTube, Printables, Etsy, Amazon, and everything else Shrey is building.",
  alternates: { canonical: absoluteUrl("/links") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/links"),
    title: "Links | Shreyash Gupta",
    description:
      "OffGrid Devices shop, YouTube, Printables, Etsy, Amazon, and everything else Shrey is building.",
  },
  twitter: {
    card: "summary",
    title: "Links | Shreyash Gupta",
    description:
      "OffGrid Devices shop, YouTube, Printables, Etsy, Amazon, and everything else Shrey is building.",
  },
};

// ─── Reusable card components ─────────────────────────────────────────────────

type LinkCardProps = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  primary?: boolean;
};

function LinkCard({ href, label, description, icon, badge, primary }: LinkCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-intent="hover"
      className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 ${
        primary
          ? "bg-foreground text-background border-foreground hover:opacity-90 shadow-premium-lg"
          : "card-elevated hover-lift"
      }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
          primary ? "bg-background/15" : "bg-muted"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${primary ? "text-background" : "text-foreground"}`}>
            {label}
          </span>
          {badge && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                primary
                  ? "bg-background/20 text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className={`text-xs mt-0.5 leading-relaxed ${primary ? "text-background/70" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>
      <svg
        className={`flex-shrink-0 w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          primary ? "text-background/60" : "text-muted-foreground"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    </Link>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-8 first:mt-0">
      {children}
    </h2>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ShopIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M17 17H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 9h6M9 13h4" />
  </svg>
);

const EtsyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.16 4.61c0-.63.08-1.62 1.44-1.62H17V1.02S14.78 1 13.17 1C9.28 1 7.2 3.2 7.2 6.29v1.49H5.01v2.08H7.2V21h2.87V9.86h2.86l.38-2.08H10.1V4.61zM18.99 7.78H16.1v13.21h2.89V7.78zm-1.45-4.8a1.63 1.63 0 100 3.26 1.63 1.63 0 000-3.26z" />
  </svg>
);

const AmazonIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.93 17.09c-2.19 1.52-5.37 2.33-8.11 2.33-3.84 0-7.29-1.42-9.9-3.78-.2-.18-.02-.43.22-.29 2.82 1.64 6.31 2.63 9.91 2.63 2.43 0 5.1-.5 7.55-1.54.37-.16.68.24.33.65zm.95-1.08c-.28-.36-1.85-.17-2.56-.08-.21.03-.24-.16-.05-.29 1.25-.88 3.31-.62 3.55-.33.24.3-.06 2.38-1.24 3.37-.18.15-.35.07-.27-.13.27-.65.86-2.17.57-2.54z"/>
    <path d="M12.16 6.36c0 .96.03 1.76-.46 2.6-.4.7-1.03 1.12-1.73 1.12-.96 0-1.52-.73-1.52-1.81 0-2.13 1.91-2.52 3.71-2.52v.61zm2.52 6.08c-.16.15-.4.16-.58.06-1.67-1.39-1.42-3.34-1.42-3.34v-.01C12.68 5.89 11.3 5 9.38 5c-2.21 0-3.6 1.45-3.6 3.34 0 .9.24 1.6.65 2.16.68.93 1.81 1.42 3.09 1.42 1.42 0 2.58-.53 3.28-1.46.29.68.5 1.11.85 1.48.28.27.73.75 1.28.75.47 0 .81-.27.95-.62.03-.09.03-.15 0-.18-.32-.52-.83-1.17-.2-2.45z"/>
  </svg>
);

const PersonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Shapr3DIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        {/* Hero */}
        <div className="mt-16 mb-10 relative z-10">
          <h1 className="heading-display text-5xl md:text-7xl tracking-tight leading-none mb-4">
            Links
            <span className="text-muted-foreground">.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            I build MagSafe-compatible gear for{" "}
            <span className="text-foreground font-medium">Meshtastic</span> and{" "}
            <span className="text-foreground font-medium">MeshCore</span> under my solo
            maker brand{" "}
            <span className="text-foreground font-medium">OffGrid Devices</span>. Here&apos;s
            everything in one place.
          </p>
        </div>

        {/* Cards */}
        <div className="max-w-lg pb-16 space-y-1">

          {/* Shop */}
          <SectionHeading>Shop</SectionHeading>

          <LinkCard
            href={LINKS.offgridDevices.site}
            label="OffGrid Devices"
            description="MagSafe accessories for Meshtastic & MeshCore. Designed in Shapr3D, printed to order."
            icon={<ShopIcon />}
            badge="offgriddevices.com"
            primary
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <LinkCard
              href={LINKS.offgridDevices.etsy}
              label="Etsy Shop"
              description="Order handcrafted gear directly."
              icon={<EtsyIcon />}
            />
            <LinkCard
              href={LINKS.offgridDevices.amazon}
              label="Amazon Storefront"
              description="Find listings on Amazon."
              icon={<AmazonIcon />}
            />
          </div>

          {/* Content */}
          <SectionHeading>Content</SectionHeading>

          <LinkCard
            href={LINKS.content.youtube}
            label="YouTube"
            description="Build-in-public videos — Shapr3D CAD, 3D printing, and maker business storytelling."
            icon={<YouTubeIcon />}
            badge="@ShreyashGuptas"
          />

          <LinkCard
            href={LINKS.content.printables}
            label="Printables"
            description="Free & paid 3D printable files. Download and remix my designs."
            icon={<PrintIcon />}
            badge="Printables.com"
          />

          {/* Personal */}
          <SectionHeading>Start Here</SectionHeading>

          <LinkCard
            href={LINKS.personal.startHere}
            label="shreyashg.com"
            description="My personal site — blog, projects, and the AI chat that knows what I've been building."
            icon={<PersonIcon />}
            badge="personal site"
          />

          {/* Partnerships */}
          <SectionHeading>Creator Affiliations</SectionHeading>

          <div className="card-elevated p-5 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Shapr3DIcon />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-foreground">Shapr3D</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    Official Creator
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  I design every OffGrid Devices product in Shapr3D. It&apos;s the CAD tool I
                  genuinely use and recommend. I&apos;m part of the{" "}
                  <strong className="text-foreground font-medium">Shapr3D Creator Program</strong>
                  {" "}— links may be affiliate or creator links.
                </p>
                <Link
                  href={LINKS.partnerships.shapr3d}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-intent="hover"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-muted-foreground transition-colors duration-200"
                >
                  Visit Shapr3D
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </main>
  );
}
