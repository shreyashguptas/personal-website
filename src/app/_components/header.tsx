import Link from "next/link";

const Header = () => {
  return (
    <div className="py-6 border-b border-border">
      <Link
        href="/blog"
        data-cursor-intent="hover"
        className="group label-eyebrow inline-flex items-center gap-2 transition-smooth hover:text-foreground"
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5"
        >
          ←
        </span>
        Back to Writing
      </Link>
    </div>
  );
};

export default Header;
