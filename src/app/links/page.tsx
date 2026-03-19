import Container from "@/app/_components/container";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const LINKS = {
  offgridDevices: {
    site: "https://offgriddevices.com",
    etsy: "https://www.etsy.com/shop/OffGridDevices",
  },
  content: {
    youtube: "https://www.youtube.com/@ShreyashGuptas",
    printables: "https://www.printables.com/@ShreyashGuptas",
    twitter: "https://x.com/ShreyashGuptas",
  },
  partnerships: {
    shapr3d: "https://www.shapr3d.com",
  },
} as const;

export const metadata: Metadata = {
  title: "Links | Shreyash Gupta",
  description:
    "OffGrid Devices shop, YouTube, Printables, and everything else Shrey is building.",
  alternates: { canonical: absoluteUrl("/links") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/links"),
    title: "Links | Shreyash Gupta",
    description:
      "OffGrid Devices shop, YouTube, Printables, and everything else Shrey is building.",
  },
  twitter: {
    card: "summary",
    title: "Links | Shreyash Gupta",
    description:
      "OffGrid Devices shop, YouTube, Printables, and everything else Shrey is building.",
  },
};

// ─── Card components ─────────────────────────────────────────────────────────

type LinkCardProps = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  accentColor?: string;
  accentBg?: string;
};

function LinkCard({
  href,
  label,
  description,
  icon,
  badge,
  accentColor,
  accentBg,
}: LinkCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-intent="hover"
      className="group flex items-start gap-4 p-5 rounded-xl border card-elevated hover-lift"
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={accentBg ? { backgroundColor: accentBg } : undefined}
      >
        <div style={accentColor ? { color: accentColor } : undefined}>
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">{label}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <svg
        className="flex-shrink-0 w-4 h-4 mt-0.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 17L17 7M17 7H7M17 7V17"
        />
      </svg>
    </Link>
  );
}

function PrimaryCard({
  href,
  label,
  description,
  icon,
  badge,
  gradientFrom,
  gradientTo,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-intent="hover"
      className="group relative flex items-start gap-4 p-6 rounded-xl border border-transparent text-white overflow-hidden shadow-premium-lg transition-all duration-300 hover:shadow-premium-xl hover:scale-[1.01]"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{label}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs mt-1 leading-relaxed text-white/75">
          {description}
        </p>
      </div>
      <svg
        className="flex-shrink-0 w-4 h-4 mt-0.5 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 17L17 7M17 7H7M17 7V17"
        />
      </svg>
    </Link>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-10 first:mt-0">
      {children}
    </h2>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ShopIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const PrintIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17 17H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15a2 2 0 01-2 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M9 9h6M9 13h4"
    />
  </svg>
);

const EtsyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.16 4.61c0-.63.08-1.62 1.44-1.62H17V1.02S14.78 1 13.17 1C9.28 1 7.2 3.2 7.2 6.29v1.49H5.01v2.08H7.2V21h2.87V9.86h2.86l.38-2.08H10.1V4.61zM18.99 7.78H16.1v13.21h2.89V7.78zm-1.45-4.8a1.63 1.63 0 100 3.26 1.63 1.63 0 000-3.26z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        {/* Hero */}
        <div className="mt-16 mb-10 max-w-2xl mx-auto relative z-10">
          <h1 className="heading-display text-5xl md:text-7xl tracking-tight leading-none mb-4">
            Links
            <span className="text-muted-foreground">.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            I build MagSafe-compatible gear for{" "}
            <span className="text-foreground font-medium">Meshtastic</span> and{" "}
            <span className="text-foreground font-medium">MeshCore</span> under
            my solo maker brand{" "}
            <span className="text-foreground font-medium">OffGrid Devices</span>
            . Here&apos;s everything in one place.
          </p>
        </div>

        {/* Cards */}
        <div className="max-w-2xl mx-auto pb-16 space-y-1">
          {/* ── Shop ── */}
          <SectionHeading>Shop</SectionHeading>

          <PrimaryCard
            href={LINKS.offgridDevices.site}
            label="OffGrid Devices"
            description="MagSafe accessories for Meshtastic & MeshCore. Designed in Shapr3D, printed to order."
            icon={<ShopIcon />}
            badge="offgriddevices.com"
            gradientFrom="#1a5c2e"
            gradientTo="#2d8a4e"
          />

          <div className="mt-3">
            <LinkCard
              href={LINKS.offgridDevices.etsy}
              label="Etsy Shop"
              description="Order handcrafted gear directly."
              icon={<EtsyIcon />}
              accentBg="#FFF0E6"
              accentColor="#F1641E"
            />
          </div>

          {/* ── Content ── */}
          <SectionHeading>Content</SectionHeading>

          <div className="space-y-3">
            <LinkCard
              href={LINKS.content.youtube}
              label="YouTube"
              description="Build-in-public videos — Shapr3D CAD, 3D printing, and maker business storytelling."
              icon={<YouTubeIcon />}
              badge="@ShreyashGuptas"
              accentBg="#FEE2E2"
              accentColor="#DC2626"
            />

            <LinkCard
              href={LINKS.content.printables}
              label="Printables"
              description="Free & paid 3D printable files. Download and remix my designs."
              icon={<PrintIcon />}
              badge="Printables.com"
              accentBg="#FFF3E0"
              accentColor="#F57C00"
            />

            <LinkCard
              href={LINKS.content.twitter}
              label="X (Twitter)"
              description="Maker updates, build logs, and thoughts on hardware and design."
              icon={<XIcon />}
              badge="@ShreyashGuptas"
              accentBg="#F3F4F6"
              accentColor="#0F0F0F"
            />
          </div>

          {/* ── Creator Affiliations ── */}
          <SectionHeading>Creator Affiliations</SectionHeading>

          <div className="rounded-xl border overflow-hidden shadow-premium-lg">
            <div className="bg-gradient-to-r from-[#2563EB]/8 to-[#3B82F6]/5 p-6">
              <div className="flex items-start gap-5">
                <Image
                  src="/badges/badge-shapr3d.png"
                  alt="Official Shapr3D Creator badge"
                  width={56}
                  height={56}
                  className="flex-shrink-0 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-sm text-foreground">
                      Shapr3D
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-semibold">
                      Official Creator
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    I design every OffGrid Devices product in Shapr3D. It&apos;s
                    the CAD tool I genuinely use and recommend. I&apos;m part of
                    the{" "}
                    <strong className="text-foreground font-medium">
                      Shapr3D Creator Program
                    </strong>{" "}
                    — links may be affiliate or creator links.
                  </p>
                  <Link
                    href={LINKS.partnerships.shapr3d}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-intent="hover"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-200"
                  >
                    Visit Shapr3D
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 17L17 7M17 7H7M17 7V17"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
