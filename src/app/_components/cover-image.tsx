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
  const heightClass = variant === "hero" ? "h-80" : "h-64";
  
  const image = (
    <div className={cn("relative w-full overflow-hidden rounded-lg shadow-sm", heightClass)}>
      <Image
        src={src}
        alt={`Cover Image for ${title}`}
        fill
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
        <Link href={`/posts/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
