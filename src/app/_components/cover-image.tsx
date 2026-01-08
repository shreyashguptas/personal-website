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
  // Use aspect-ratio instead of fixed heights for CLS prevention
  const aspectClass = variant === "hero" ? "aspect-[16/9]" : "aspect-[3/2]";

  const image = (
    <div className={cn("relative w-full overflow-hidden rounded-lg shadow-sm", aspectClass)}>
      <Image
        src={src}
        alt={`Cover Image for ${title}`}
        fill
        priority={variant === "hero"}
        className={cn("object-cover", {
          "hover:shadow-lg transition-shadow duration-200": slug,
        })}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title} data-cursor-intent="hover">
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
