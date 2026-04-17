import Container from "@/app/_components/container";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const LINKS = {
  offgridDevices: {
    site: "https://offgridevices.com",
    etsy: "https://www.etsy.com/shop/OffGridDevices",
  },
  content: {
    youtube: "https://www.youtube.com/@ShreyashGuptas",
    printables: "https://www.printables.com/@ShreyashGuptas",
    twitter: "https://x.com/ShreyashGuptas",
  },
  podcast: {
    spotify:
      "https://open.spotify.com/show/4WDAio2kR6DbCkyuMRX8ea?si=09f8a9508f9a41b5",
    apple:
      "https://podcasts.apple.com/us/podcast/the-federalist-papers-explained/id1885411973?i=1000756176308",
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

const PrintablesIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3.678 4.8 12 9.6v9.6l8.322-4.8V4.8L12 0ZM12 19.2l-8.322-4.8V24Z" />
  </svg>
);

const EtsyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.559 2.445c0-.325.033-.52.59-.52h7.465c1.3 0 2.02 1.11 2.54 3.193l.42 1.666h1.27c.23-4.728.43-6.784.43-6.784s-3.196.36-5.09.36H6.635L1.521.196v1.37l1.725.326c1.21.24 1.5.496 1.6 1.606 0 0 .11 3.27.11 8.64 0 5.385-.09 8.61-.09 8.61 0 .973-.39 1.333-1.59 1.573l-1.722.33V24l5.13-.165h8.55c1.935 0 6.39.165 6.39.165.105-1.17.75-6.48.855-7.064h-1.2l-1.284 2.91c-1.005 2.28-2.476 2.445-4.11 2.445h-4.906c-1.63 0-2.415-.64-2.415-2.05V12.8s3.62 0 4.79.096c.912.064 1.463.325 1.76 1.598l.39 1.695h1.41l-.09-4.278.192-4.305h-1.391l-.45 1.89c-.283 1.244-.48 1.47-1.754 1.6-1.666.17-4.815.14-4.815.14V2.45h-.05z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SpotifyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const ApplePodcastIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59.12 2.2.007 2.864a8.506 8.506 0 01-3.24 5.296c-.608.46-2.096 1.261-2.336 1.261-.088 0-.096-.091-.056-.46.072-.592.144-.715.48-.856.536-.224 1.448-.874 2.008-1.435a7.644 7.644 0 002.008-3.536c.208-.824.184-2.656-.048-3.504-.728-2.696-2.928-4.792-5.624-5.352-.784-.16-2.208-.16-3 0-2.728.56-4.984 2.76-5.672 5.528-.184.752-.184 2.584 0 3.336.456 1.832 1.64 3.512 3.192 4.512.304.2.672.408.824.472.336.144.408.264.472.856.04.36.03.464-.056.464-.056 0-.464-.176-.896-.384l-.04-.03c-2.472-1.216-4.056-3.274-4.632-6.012-.144-.706-.168-2.392-.03-3.04.36-1.74 1.048-3.1 2.192-4.304 1.648-1.737 3.768-2.656 6.128-2.656zm.134 2.81c.409.004.803.04 1.106.106 2.784.62 4.76 3.408 4.376 6.174-.152 1.114-.536 2.03-1.216 2.88-.336.43-1.152 1.15-1.296 1.15-.023 0-.048-.272-.048-.603v-.605l.416-.496c1.568-1.878 1.456-4.502-.256-6.224-.664-.67-1.432-1.064-2.424-1.246-.64-.118-.776-.118-1.448-.008-1.02.167-1.81.562-2.512 1.256-1.72 1.704-1.832 4.342-.264 6.222l.413.496v.608c0 .336-.027.608-.06.608-.03 0-.264-.16-.512-.36l-.034-.011c-.832-.664-1.568-1.842-1.872-2.997-.184-.698-.184-2.024.008-2.72.504-1.878 1.888-3.335 3.808-4.019.41-.145 1.133-.22 1.814-.211zm-.13 2.99c.31 0 .62.06.844.178.488.253.888.745 1.04 1.259.464 1.578-1.208 2.96-2.72 2.254h-.015c-.712-.331-1.096-.956-1.104-1.77 0-.733.408-1.371 1.112-1.745.224-.117.534-.176.844-.176zm-.011 4.728c.988-.004 1.706.349 1.97.97.198.464.124 1.932-.218 4.302-.232 1.656-.36 2.074-.68 2.356-.44.39-1.064.498-1.656.288h-.003c-.716-.257-.87-.605-1.164-2.644-.341-2.37-.416-3.838-.218-4.302.262-.616.974-.966 1.97-.97z" />
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
            badge="offgridevices.com"
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
              icon={<PrintablesIcon />}
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

          {/* ── Podcast ── */}
          <SectionHeading>Podcast</SectionHeading>

          <div className="rounded-xl border overflow-hidden shadow-premium-lg">
            <div className="bg-gradient-to-r from-[#2A1A0E]/5 to-[#8B6914]/5 p-6">
              <div className="flex items-start gap-5">
                <Image
                  src="/project/federalist-papers-podcast.png"
                  alt="The Federalist Papers: Explained podcast cover art"
                  width={48}
                  height={48}
                  className="flex-shrink-0 rounded-lg shadow-premium-sm"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm text-foreground">
                    The Federalist Papers: Explained
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    A plain-English podcast walking through the Federalist Papers
                    one essay at a time. AI-generated using OpenAI, Claude, and
                    ElevenLabs.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/50">
              <Link
                href={LINKS.podcast.spotify}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-intent="hover"
                className="group flex items-center gap-3 p-4 bg-card hover:bg-accent/50 transition-colors duration-200"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5E9", color: "#1DB954" }}
                >
                  <SpotifyIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-foreground">
                    Spotify
                  </span>
                </div>
                <svg
                  className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
              <Link
                href={LINKS.podcast.apple}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-intent="hover"
                className="group flex items-center gap-3 p-4 bg-card hover:bg-accent/50 transition-colors duration-200"
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#F3E5F5", color: "#9933CC" }}
                >
                  <ApplePodcastIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-foreground">
                    Apple Podcasts
                  </span>
                </div>
                <svg
                  className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
