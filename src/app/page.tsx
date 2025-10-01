import Container from "@/app/_components/container";
import Image from "next/image";
import { InlineChat } from "@/app/_components/inline-chat";
import { MotionObserver } from "@/app/_components/motion-observer";
import type { CSSProperties } from "react";

export default function HomePage() {
  const fade = (ms: number): CSSProperties => ({
    "--fade-delay": `${ms}ms`,
  }) as CSSProperties;

  return (
    <main className="relative min-h-[calc(100vh-8rem)] flex flex-col">
      <MotionObserver />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-accent/40 blur-3xl animate-soft-glow" aria-hidden="true" />
        <div
          className="absolute -bottom-28 -right-16 h-[28rem] w-[28rem] rounded-full bg-muted/40 blur-3xl animate-soft-glow"
          style={{ animationDelay: "-2s" }}
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.45),transparent_75%)] opacity-40 bg-grid-motion" aria-hidden="true" />
      </div>

      <Container className="flex-1 flex flex-col">
        <div className="py-12 md:py-16 lg:py-20 flex-1 flex flex-col">
          <div className="desktop:grid desktop:grid-cols-[minmax(320px,540px)_1fr] desktop:gap-12 desktop:items-center flex-1">
            <div className="flex flex-col items-start desktop:justify-center desktop:min-h-[70vh] gap-6">
              <div
                className="group relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60"
                data-animate="fade-up"
                style={fade(0)}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/50 to-muted/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 animate-soft-glow" />
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-border/50 shadow-premium-lg transition-all duration-300 group-hover:ring-border group-hover:shadow-premium-xl animate-hero-float"
                  style={{ willChange: "transform" }}
                >
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

              <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.95] text-left space-y-2">
                <span className="block" data-animate="fade-up" style={fade(120)}>
                  Shreyash
                </span>
                <span className="block text-muted-foreground" data-animate="fade-up" style={fade(220)}>
                  Gupta.
                </span>
              </h1>

              <p
                className="mt-2 text-base md:text-lg text-muted-foreground max-w-md hidden desktop:block"
                data-animate="fade-up"
                style={fade(320)}
              >
                Building products, writing code, and sharing insights on technology and productivity.
              </p>

              <div
                className="hidden desktop:flex items-center gap-4 pt-2"
                data-animate="fade-up"
                style={fade(420)}
              >
                <span className="h-px w-16 bg-border/60" aria-hidden="true" />
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground/70">Always iterating</p>
              </div>
            </div>

            <div
              className="mt-10 desktop:mt-0 flex-1 flex flex-col"
              data-animate="fade-left"
              style={fade(260)}
            >
              <InlineChat />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
