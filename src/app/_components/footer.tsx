import { MinimalNavigation } from "./minimal-navigation";
import { SocialLinks } from "./social-links";

export function SiteFooter() {
  return (
    <footer className="mt-12 md:mt-16 border-t border-border/50">
      <div className="container mx-auto px-5 py-6 md:py-8">
        <div className="flex flex-col items-center gap-6">
          <MinimalNavigation />
          <SocialLinks />
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shreyash Gupta
          </div>
        </div>
      </div>
    </footer>
  );
}


