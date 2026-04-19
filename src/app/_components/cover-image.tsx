import cn from "classnames";
import Link from "next/link";
import Image from "next/image";

type Props = {
  title: string;
  src: string;
  slug?: string;
  variant?: "default" | "hero";
};

const CoverImage = ({ title, src, slug, variant = "default" }: Props) => {
  const aspectClass = variant === "hero" ? "aspect-[16/9]" : "aspect-[3/2]";

  const image = (
    <div
      className={cn(
        "relative w-full overflow-hidden border border-border",
        aspectClass
      )}
      style={{ borderRadius: "var(--radius)" }}
    >
      <Image
        src={src}
        alt={`Cover image — ${title}`}
        fill
        priority={variant === "hero"}
        className="object-cover"
        quality={90}
        sizes={
          variant === "hero"
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
        }
      />
    </div>
  );

  return slug ? (
    <Link href={`/posts/${slug}`} aria-label={title} data-cursor-intent="hover">
      {image}
    </Link>
  ) : (
    image
  );
};

export default CoverImage;
