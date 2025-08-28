import { MinimalNavigation } from "./minimal-navigation";
import { SocialLinks } from "./social-links";

export function SiteFooter() {
  return (
    <footer className="mt-6 md:mt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-5 py-5">
        <div className="flex flex-col items-center gap-6">
          <MinimalNavigation />
          <SocialLinks />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Shreyash Gupta
          </div>
        </div>
      </div>
    </footer>
  );
}


