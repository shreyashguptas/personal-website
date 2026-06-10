import Link from "next/link";
import cn from "classnames";

type Props = {
  title: string;
  slug?: string;
  variant?: "default" | "hero";
};

// Curated, editorial glyphs used as a faint watermark. Keeps the newsprint feel
// without resorting to loud illustration.
const GLYPHS = ["¶", "§", "❝", "✶", "✦", "—"];

// Deterministic, stable hash so a given post always renders the same plate.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * A typographic "newsprint plate" shown in place of a cover image when a post
 * has none. Neutral palette to match the editorial theme; the only color is a
 * short masthead-red rule, used sparingly. The look is deterministic per slug.
 */
const FallbackCover = ({ title, slug, variant = "default" }: Props) => {
  const aspectClass = variant === "hero" ? "aspect-[16/9]" : "aspect-[3/2]";
  const seed = hashString(slug || title);
  const glyph = GLYPHS[seed % GLYPHS.length];
  // Subtle, deterministic variation in the hairline texture angle.
  const angle = [-12, 0, 12, 24][seed % 4];

  const plate = (
    <div
      className={cn(
        "img-zoom relative w-full overflow-hidden border border-border bg-card transition-smooth",
        aspectClass
      )}
      style={{ borderRadius: "var(--radius)" }}
    >
      {/* Faint diagonal hairline texture — evokes newsprint without noise. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `repeating-linear-gradient(${angle}deg, hsl(var(--border)) 0, hsl(var(--border)) 1px, transparent 1px, transparent 11px)`,
          maskImage: "linear-gradient(180deg, transparent, black 55%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 55%)",
        }}
      />

      {/* Oversized watermark glyph, intentionally clipped at the corner. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-6 select-none font-serif leading-none text-muted-foreground/10"
        style={{ fontSize: variant === "hero" ? "12rem" : "9rem" }}
      >
        {glyph}
      </span>

      {/* Title block, bottom-anchored like a caption. */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
        <span className="label-eyebrow mb-3">Essay</span>
        <div
          aria-hidden="true"
          className="mb-3 h-[3px] w-10"
          style={{ backgroundColor: "hsl(var(--accent))" }}
        />
        <h3
          className={cn(
            "font-serif font-medium text-foreground line-clamp-3",
            variant === "hero" ? "text-2xl md:text-[1.75rem] leading-snug" : "text-xl leading-snug"
          )}
        >
          {title}
        </h3>
      </div>
    </div>
  );

  return slug ? (
    <Link
      href={`/posts/${slug}`}
      aria-label={title}
      data-cursor-intent="hover"
      className="group block"
    >
      {plate}
    </Link>
  ) : (
    plate
  );
};

export default FallbackCover;
