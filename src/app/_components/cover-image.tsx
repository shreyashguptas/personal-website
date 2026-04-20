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
            ? "(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), (max-width: 1200px) 60vw, 700px"
            : "(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 2rem), 500px"
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
