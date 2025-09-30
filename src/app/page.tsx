import Container from "@/app/_components/container";
import Image from "next/image";
import { InlineChat } from "@/app/_components/inline-chat";

export default function HomePage() {
  // Removed content listings to focus on a clean chat-first landing
  return (
    <main className="relative min-h-[calc(100vh-4rem)]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
      </div>
      
      <Container>
        <div className="py-12 md:py-16 lg:py-20">
          <div className="desktop:grid desktop:grid-cols-[minmax(320px,540px)_1fr] desktop:gap-12 desktop:items-center">
            {/* Left column: image and name, centered vertically on desktop */}
            <div className="flex flex-col items-start desktop:justify-center desktop:min-h-[60vh]">
              {/* Enhanced headshot with premium styling */}
              <div className="group relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/50 to-muted/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-border/50 shadow-premium-lg transition-all duration-300 group-hover:ring-border group-hover:shadow-premium-xl">
                  <Image
                    src="/headshot/headshot.jpg"
                    alt="Shreyash Gupta"
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    priority
                    sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 176px, (max-width: 1280px) 208px, 240px"
                  />
                </div>
              </div>
              
              {/* Enhanced title with better typography */}
              <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.95] text-left">
                <span className="block">Shreyash</span>
                <span className="block text-muted-foreground">Gupta.</span>
              </h1>
              
              {/* Optional: Add a subtle tagline or CTA on larger screens */}
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-md hidden desktop:block">
                Building products, writing code, and sharing insights on technology and productivity.
              </p>
            </div>

            {/* Right column: enhanced chat interface */}
            <div className="mt-10 desktop:mt-0">
              <InlineChat />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
