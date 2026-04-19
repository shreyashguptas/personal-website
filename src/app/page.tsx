import Container from "@/app/_components/container";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getAllPosts, getAllProjects } from "@/lib/api";
import DateFormatter from "@/app/_components/date-formatter";
import { extractYearFromDate } from "@/lib/utils";

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

  const latestPost = posts[0];
  const secondaryPosts = posts.slice(1, 4);
  const featuredProject = projects[0];

  const earliestYear = posts.length
    ? posts.reduce((y, p) => {
        const year = Number(extractYearFromDate(p.date));
        return isNaN(year) ? y : Math.min(y, year);
      }, Number.POSITIVE_INFINITY)
    : new Date().getFullYear();

  const metrics: { label: string; value: string; sub?: string }[] = [
    { label: "Essays Published", value: String(posts.length) },
    { label: "Projects Shipped", value: String(projects.length) },
    { label: "Writing Since", value: Number.isFinite(earliestYear) ? String(earliestYear) : "—" },
    { label: "Day Job", value: "Data Sci." },
  ];

  return (
    <Container className="animate-fade-in">
      {/* ── Lead story ──────────────────────────────────────────── */}
      <section className="py-12 md:py-20 border-b border-border">
        <p className="label-eyebrow mb-5">The Lead</p>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            <h1 className="display-2xl">
              Data, software, and the quiet craft of building things
              <span aria-hidden="true" style={{ color: "hsl(var(--accent))" }}>
                .
              </span>
            </h1>
            <p className="mt-8 font-serif text-lg leading-[1.7] text-foreground max-w-2xl">
              I&apos;m <strong className="font-medium">Shreyash Gupta</strong> — a data
              scientist and software engineer writing about the tools I use, the
              projects I ship, and the hardware I design under OffGrid Devices. Ask
              anything below, or read the essays.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/blog"
                data-cursor-intent="hover"
                className="inline-flex items-center text-sm font-medium text-foreground underline decoration-border hover:decoration-foreground underline-offset-4"
              >
                Read the writing →
              </Link>
              <Link
                href="/projects"
                data-cursor-intent="hover"
                className="inline-flex items-center text-sm font-medium text-foreground underline decoration-border hover:decoration-foreground underline-offset-4"
              >
                Browse the projects →
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-border">
            <div className="overflow-hidden border border-border" style={{ borderRadius: "var(--radius)" }}>
              <Image
                src="/headshot/headshot.jpg"
                alt="Shreyash Gupta portrait"
                width={480}
                height={480}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-baseline gap-3">
                <dt className="label-eyebrow shrink-0 w-16">Role</dt>
                <dd className="text-foreground">Data Scientist</dd>
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

      {/* ── Metrics row ─────────────────────────────────────────── */}
      <section className="py-10 md:py-12 border-b border-border">
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={[
                "px-4 md:px-6 py-4",
                i !== metrics.length - 1 ? "md:border-r md:border-border" : "",
                i < metrics.length - 2 ? "border-b md:border-b-0 border-border" : "",
              ].join(" ")}
            >
              <dt className="label-eyebrow">{m.label}</dt>
              <dd className="mt-3 tabular text-2xl md:text-3xl font-medium text-foreground">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Featured + Ask ──────────────────────────────────────── */}
      <section className="py-12 md:py-16 border-b border-border grid grid-cols-1 lg:grid-cols-12 gap-10">
        {latestPost && (
          <div className="lg:col-span-7">
            <p className="label-eyebrow mb-4">Latest Essay</p>
            <h2 className="display-lg">
              <Link
                href={`/posts/${latestPost.slug}`}
                data-cursor-intent="hover"
                className="hover:text-muted-foreground transition-colors"
              >
                {latestPost.title}
              </Link>
            </h2>
            <p className="mt-5 font-serif text-lg leading-relaxed text-muted-foreground">
              {latestPost.excerpt}
            </p>
            <p className="mt-5 tabular text-xs uppercase tracking-wider text-muted-foreground">
              <DateFormatter dateString={latestPost.date} />
            </p>
          </div>
        )}

        <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
          <p className="label-eyebrow mb-4">Ask Anything</p>
          <div
            className="border border-border bg-card p-5"
            style={{ borderRadius: "var(--radius)" }}
          >
            <InlineChat />
          </div>
        </div>
      </section>

      {/* ── Featured project ────────────────────────────────────── */}
      {featuredProject && (
        <section className="py-12 md:py-16 border-b border-border">
          <p className="label-eyebrow mb-4">Featured Project</p>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
            <div className="md:col-span-2">
              <p className="label-eyebrow tabular">
                {extractYearFromDate(featuredProject.date)}
              </p>
            </div>
            <div className="md:col-span-10">
              <h2 className="display-md">
                {featuredProject.projectUrl ? (
                  <a
                    href={featuredProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-intent="hover"
                    className="hover:text-muted-foreground transition-colors"
                  >
                    {featuredProject.title}
                  </a>
                ) : (
                  featuredProject.title
                )}
              </h2>
              <p className="mt-4 font-serif text-lg leading-relaxed text-muted-foreground max-w-2xl">
                {featuredProject.description}
              </p>
              <Link
                href="/projects"
                data-cursor-intent="hover"
                className="mt-5 inline-flex items-center text-sm font-medium underline decoration-border hover:decoration-foreground underline-offset-4"
              >
                All projects →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Recent essays list ─────────────────────────────────── */}
      {secondaryPosts.length > 0 && (
        <section className="py-12 md:py-16">
          <header className="flex items-baseline justify-between border-b border-border pb-4 mb-2">
            <h2 className="label-eyebrow">From the Archive</h2>
            <Link
              href="/blog"
              data-cursor-intent="hover"
              className="label-eyebrow hover:text-foreground transition-colors"
            >
              See all →
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {secondaryPosts.map((p) => (
              <li key={p.slug} className="py-6 md:py-7 grid grid-cols-1 md:grid-cols-12 gap-4">
                <p className="md:col-span-3 label-eyebrow tabular self-start md:pt-2">
                  <DateFormatter dateString={p.date} />
                </p>
                <div className="md:col-span-9">
                  <h3 className="display-sm">
                    <Link
                      href={`/posts/${p.slug}`}
                      data-cursor-intent="hover"
                      className="hover:text-muted-foreground transition-colors"
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-2 font-serif text-base leading-relaxed text-muted-foreground max-w-xl">
                    {p.excerpt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
