import Link from "next/link";

const Header = () => {
  return (
    <div className="py-6 border-b border-border">
      <Link
        href="/blog"
        data-cursor-intent="hover"
        className="label-eyebrow inline-flex items-center gap-2 hover:text-foreground transition-colors"
      >
        ← Back to Writing
      </Link>
    </div>
  );
};

export default Header;
