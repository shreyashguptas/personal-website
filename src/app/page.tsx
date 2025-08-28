import Container from "@/app/_components/container";
import { MinimalNavigation } from "@/app/_components/minimal-navigation";
import { SocialLinks } from "@/app/_components/social-links";
import Image from "next/image";
import { InlineChat } from "@/app/_components/inline-chat";

export default function HomePage() {
  // Removed content listings to focus on a clean chat-first landing

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        {/* Mobile/Tablet Layout (below 1412px) */}
        <div className="desktop:hidden">
          <div className="mt-16 max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
            {/* Image above title - left-aligned on all sizes */}
            <div className="flex justify-start mb-8">
              <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                <Image
                  src="/headshot/headshot.jpg"
                  alt="Shreyash Gupta"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>
            
            {/* Title - responsive sizing, left-aligned */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight text-left mb-16">
              Shreyash Gupta.
            </h1>

            {/* Content sections - responsive width and spacing */}
            <div className="max-w-2xl mx-auto sm:mx-0 space-y-12">
              {/* Inline Chat (primary section) */}
              <InlineChat />

              {/* Explore more */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-sm opacity-80 mb-2">Explore more</div>
                <div className="flex items-center gap-4 text-sm">
                  <a className="underline" href="/blog">Blog</a>
                  <a className="underline" href="/projects">Projects</a>
                </div>
              </div>

              {/* Minimal navigation & social */}
              <MinimalNavigation />
              <SocialLinks />
            </div>
          </div>
        </div>

        {/* Desktop Layout (1412px and above) */}
        <div className="hidden desktop:block">
          <div className="mt-16 relative z-10">
            <h1 className="text-5xl desktop:text-8xl font-bold tracking-tighter leading-tight text-left mb-16">
              Shreyash Gupta.
            </h1>

            {/* Content sections */}
            <div className="max-w-lg space-y-12">
              {/* Inline Chat (primary section) */}
              <InlineChat />

              {/* Explore more */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-sm opacity-80 mb-2">Explore more</div>
                <div className="flex items-center gap-4 text-sm">
                  <a className="underline" href="/blog">Blog</a>
                  <a className="underline" href="/projects">Projects</a>
                </div>
              </div>

              {/* Minimal navigation & social */}
              <MinimalNavigation />
              <SocialLinks />
            </div>
          </div>
        </div>
      </Container>
      
      {/* Desktop: Right-side headshot image with full height (1412px and above) */}
      <div className="hidden desktop:block absolute top-0 right-0 h-screen w-1/2 overflow-hidden">
        <div className="relative h-full w-full translate-x-[45%]">
          <Image
            src="/headshot/headshot.jpg"
            alt="Shreyash Gupta"
            fill
            className="object-cover object-[105%_center]"
            priority
          />
        </div>
      </div>
    </main>
  );
}
