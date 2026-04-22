import Container from "@/app/_components/container";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getAllPosts, getAllProjects } from "@/lib/api";
import DateFormatter from "@/app/_components/date-formatter";

const InlineChat = dynamic(
  () => import("@/app/_components/inline-chat").then((mod) => ({ default: mod.InlineChat })),
  {
    loading: () => (
      <div className="min-h-[240px] flex items-center justify-center text-sm text-muted-foreground">
        Loading.
      </div>
    ),
  }
);

export default function HomePage() {
  const posts = getAllPosts();
  const projects = getAllProjects();

  const writingEntries = posts.slice(0, 2);
  const featuredProject = projects[0];

  return (
    <Container className="animate-fade-in">
      {/* ── Zone A · The Column ─────────────────────────────────── */}
      <section className="py-12 md:py-20 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-8 stagger-child" style={{ ["--stagger-index" as string]: 0 }}>
            <p className="label-eyebrow mb-5">The Column · Ask Shrey</p>
            <h1 className="display-xl">
              What do you want to know
              <span aria-hidden="true" className="animate-breathe inline-block" style={{ color: "hsl(var(--accent))" }}>
                ?
              </span>
            </h1>
            <p className="mt-6 font-serif text-lg leading-[1.7] text-foreground max-w-2xl">
              A conversational index of everything I&apos;ve written and built. Ask
              about the essays, OffGrid Devices, the tools I use, or how I got here —
              answers are grounded in my own writing.
            </p>

            <div
              className="mt-8 border border-border bg-card p-5 md:p-6 transition-smooth focus-glow hover:border-foreground/25"
              style={{ borderRadius: "var(--radius)" }}
            >
              <InlineChat variant="editorial" />
            </div>
          </div>

          <aside className="lg:col-span-4 lg:pl-10 lg:border-l lg:border-border stagger-child" style={{ ["--stagger-index" as string]: 1 }}>
            <div
              className="img-zoom border border-border"
              style={{ borderRadius: "var(--radius)" }}
            >
              <Image
                src="/headshot/headshot.jpg"
                alt="Shreyash Gupta portrait"
                width={512}
                height={512}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <p className="mt-5 font-serif text-base leading-relaxed text-foreground">
              <strong className="font-medium">Shreyash Gupta</strong> — data
              scientist and software engineer. Builds OffGrid Devices on the side.
              Writes about the tools, the code, and the craft.
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-baseline gap-3">
                <dt className="label-eyebrow shrink-0 w-16">Role</dt>
                <dd className="text-foreground">Data Analyst</dd>
              </div>
              <div className="flex items-baseline gap-3">
                <dt className="label-eyebrow shrink-0 w-16">Building</dt>
                <dd className="text-foreground">OffGrid Devices</dd>
              </div>
              <div className="flex items-baseline gap-3">
                <dt className="label-eyebrow shrink-0 w-16">Writing</dt>
                <dd className="text-foreground">Essays + notes</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* ── Zone B · The Index ──────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-border">
          {/* Writing */}
          <div className="md:pr-8 pb-8 md:pb-0 border-b md:border-b-0 border-border stagger-child" style={{ ["--stagger-index" as string]: 2 }}>
            <p className="label-eyebrow mb-5">Writing</p>
            <ul className="space-y-5">
              {writingEntries.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/posts/${p.slug}`}
                    data-cursor-intent="hover"
                    className="block group"
                  >
                    <h3 className="display-sm text-xl transition-smooth group-hover:text-muted-foreground">
                      <span className="text-tug">{p.title}</span>
                    </h3>
                    <p className="mt-2 label-eyebrow tabular">
                      <DateFormatter dateString={p.date} />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/blog"
              data-cursor-intent="hover"
              className="group mt-6 inline-flex items-center gap-1 text-sm font-medium underline decoration-border underline-offset-4 transition-smooth hover:decoration-foreground"
            >
              All essays <span aria-hidden="true" className="link-arrow">→</span>
            </Link>
          </div>

          {/* Building */}
          <div className="md:px-8 py-8 md:py-0 border-b md:border-b-0 border-border stagger-child" style={{ ["--stagger-index" as string]: 3 }}>
            <p className="label-eyebrow mb-5">Building</p>
            {featuredProject && (
              <div>
                <h3 className="display-sm text-xl">
                  {featuredProject.projectUrl ? (
                    <a
                      href={featuredProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-intent="hover"
                      className="group inline-flex transition-smooth hover:text-muted-foreground"
                    >
                      <span className="text-tug">{featuredProject.title}</span>
                    </a>
                  ) : (
                    featuredProject.title
                  )}
                </h3>
                <p className="mt-2 font-serif text-base leading-relaxed text-muted-foreground">
                  {featuredProject.description}
                </p>
              </div>
            )}
            <Link
              href="/projects"
              data-cursor-intent="hover"
              className="group mt-6 inline-flex items-center gap-1 text-sm font-medium underline decoration-border underline-offset-4 transition-smooth hover:decoration-foreground"
            >
              All projects <span aria-hidden="true" className="link-arrow">→</span>
            </Link>
          </div>

          {/* Elsewhere */}
          <div className="md:pl-8 pt-8 md:pt-0 stagger-child" style={{ ["--stagger-index" as string]: 4 }}>
            <p className="label-eyebrow mb-5">Elsewhere</p>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://offgridevices.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-intent="hover"
                  className="block group"
                >
                  <h3 className="display-sm text-xl transition-smooth group-hover:text-muted-foreground">
                    <span className="text-tug">OffGrid Devices</span>
                  </h3>
                  <p className="mt-1 font-serif text-sm text-muted-foreground">
                    MagSafe accessories for Meshtastic and MeshCore.
                  </p>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@ShreyashGuptas"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-intent="hover"
                  className="block group"
                >
                  <h3 className="display-sm text-xl transition-smooth group-hover:text-muted-foreground">
                    <span className="text-tug">YouTube</span>
                  </h3>
                  <p className="mt-1 font-serif text-sm text-muted-foreground">
                    Build-in-public videos, CAD, and 3D printing.
                  </p>
                </a>
              </li>
            </ul>
            <Link
              href="/links"
              data-cursor-intent="hover"
              className="group mt-6 inline-flex items-center gap-1 text-sm font-medium underline decoration-border underline-offset-4 transition-smooth hover:decoration-foreground"
            >
              Everything <span aria-hidden="true" className="link-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}
