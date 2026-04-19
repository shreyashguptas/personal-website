import Container from "@/app/_components/container";
import { Intro } from "@/app/_components/intro";
import {
  ApplePodcastsIcon,
  EtsyIcon,
  PrintablesIcon,
  SpotifyIcon,
  XIcon,
  YoutubeIcon,
} from "@/app/_components/brand-icons";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, ArrowUpRight } from "lucide-react";

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

type Row = {
  href: string;
  label: string;
  description: string;
  tag?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  imageSrc?: string;
  imageAlt?: string;
};

function SectionHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <header className="flex items-baseline justify-between border-b border-border pb-3 mb-1">
      <h2 className="label-eyebrow">{children}</h2>
      {typeof count === "number" && (
        <p className="label-eyebrow tabular">
          {String(count).padStart(2, "0")} {count === 1 ? "entry" : "entries"}
        </p>
      )}
    </header>
  );
}

function LinkRow({ href, label, description, tag, Icon, imageSrc, imageAlt }: Row) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-intent="hover"
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5 md:py-6 border-b border-border last:border-b-0 hover:bg-secondary/40 transition-colors"
    >
      <span className="shrink-0 w-10 h-10 inline-flex items-center justify-center border border-border text-foreground overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : Icon ? (
          <Icon className="w-4 h-4" aria-hidden="true" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-3 flex-wrap">
          <span className="display-sm text-xl md:text-2xl">{label}</span>
          {tag && <span className="label-eyebrow tabular">{tag}</span>}
        </span>
        <span className="block mt-1 font-serif text-base leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowUpRight
        className="hidden md:block w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </a>
  );
}

export default function LinksPage() {
  const shopLinks: Row[] = [
    {
      href: LINKS.offgridDevices.site,
      label: "OffGrid Devices",
      description:
        "MagSafe accessories for Meshtastic and MeshCore. Designed in Shapr3D, printed to order.",
      tag: "offgridevices.com",
      imageSrc: "/brand/offgrid-devices-logo.png",
      imageAlt: "OffGrid Devices logo",
    },
    {
      href: LINKS.offgridDevices.etsy,
      label: "Etsy Shop",
      description: "Order handcrafted gear directly.",
      tag: "OffGridDevices",
      Icon: EtsyIcon,
    },
  ];

  const contentLinks: Row[] = [
    {
      href: LINKS.content.youtube,
      label: "YouTube",
      description:
        "Build-in-public videos — Shapr3D CAD, 3D printing, and maker business storytelling.",
      tag: "@ShreyashGuptas",
      Icon: YoutubeIcon,
    },
    {
      href: LINKS.content.printables,
      label: "Printables",
      description: "Free and paid 3D printable files. Download and remix my designs.",
      tag: "printables.com",
      Icon: PrintablesIcon,
    },
    {
      href: LINKS.content.twitter,
      label: "X (Twitter)",
      description: "Maker updates, build logs, and thoughts on hardware and design.",
      tag: "@ShreyashGuptas",
      Icon: XIcon,
    },
  ];

  const podcastLinks: Row[] = [
    {
      href: LINKS.podcast.spotify,
      label: "Spotify",
      description: "The Federalist Papers: Explained — Spotify.",
      tag: "Podcast",
      Icon: SpotifyIcon,
    },
    {
      href: LINKS.podcast.apple,
      label: "Apple Podcasts",
      description: "The Federalist Papers: Explained — Apple Podcasts.",
      tag: "Podcast",
      Icon: ApplePodcastsIcon,
    },
  ];

  return (
    <Container className="animate-fade-in">
      <Intro
        eyebrow="The Index"
        title="Everything in one place."
        description="Shop, content, podcast, and partnerships — a single page that links to every meaningful thing I publish online."
      />

      {/* ── Shop ── */}
      <section className="py-10 md:py-14 border-b border-border">
        <SectionHeading count={shopLinks.length}>Shop</SectionHeading>
        <div>
          {shopLinks.map((row) => (
            <LinkRow key={row.href} {...row} />
          ))}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-10 md:py-14 border-b border-border">
        <SectionHeading count={contentLinks.length}>Content</SectionHeading>
        <div>
          {contentLinks.map((row) => (
            <LinkRow key={row.href} {...row} />
          ))}
        </div>
      </section>

      {/* ── Podcast ── */}
      <section className="py-10 md:py-14 border-b border-border">
        <SectionHeading count={podcastLinks.length}>Podcast</SectionHeading>
        <div className="border border-border p-5 md:p-6 mb-4">
          <div className="flex items-start gap-5">
            <Image
              src="/project/federalist-papers-podcast.png"
              alt="The Federalist Papers: Explained podcast cover art"
              width={72}
              height={72}
              className="shrink-0 border border-border"
              style={{ borderRadius: "var(--radius)" }}
            />
            <div>
              <h3 className="display-sm text-xl md:text-2xl">
                The Federalist Papers: Explained
              </h3>
              <p className="mt-1 font-serif text-base leading-relaxed text-muted-foreground">
                A plain-English podcast walking through the Federalist Papers, one
                essay at a time. AI-generated using OpenAI, Claude, and ElevenLabs.
              </p>
            </div>
          </div>
        </div>
        <div>
          {podcastLinks.map((row) => (
            <LinkRow key={row.href} {...row} />
          ))}
        </div>
      </section>

      {/* ── Creator Affiliations ── */}
      <section className="py-10 md:py-14">
        <SectionHeading count={1}>Creator Affiliations</SectionHeading>
        <article className="border border-border p-5 md:p-6">
          <div className="flex items-start gap-5">
            <Image
              src="/badges/badge-shapr3d.png"
              alt="Official Shapr3D Creator badge"
              width={56}
              height={56}
              className="shrink-0 rounded-full"
            />
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="display-sm text-xl md:text-2xl">Shapr3D</h3>
                <span className="label-eyebrow inline-flex items-center gap-1.5">
                  <Award className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                  Official Creator
                </span>
              </div>
              <p className="mt-2 font-serif text-base leading-relaxed text-muted-foreground">
                I design every OffGrid Devices product in Shapr3D. It&apos;s the
                CAD tool I genuinely use and recommend. I&apos;m part of the
                Shapr3D Creator Program — links may be affiliate or creator links.
              </p>
              <Link
                href={LINKS.partnerships.shapr3d}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-intent="hover"
                className="mt-4 inline-flex items-center text-sm font-medium underline decoration-border hover:decoration-foreground underline-offset-4"
              >
                Visit Shapr3D →
              </Link>
            </div>
          </div>
        </article>
      </section>
    </Container>
  );
}
