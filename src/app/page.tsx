import Container from "@/app/_components/container";
import { MotionObserver } from "@/app/_components/motion-observer";
import Image from "next/image";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";

// Code-split the heavy chat component for better LCP
// This reduces initial JS bundle and defers hydration
const InlineChat = dynamic(
  () => import("@/app/_components/inline-chat").then((mod) => ({ default: mod.InlineChat })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[300px] animate-pulse">
        <div className="w-full max-w-md space-y-4">
          <div className="h-8 bg-muted/50 rounded-lg w-3/4 mx-auto" />
          <div className="h-4 bg-muted/30 rounded w-1/2 mx-auto" />
          <div className="grid grid-cols-2 gap-2 mt-6">
            <div className="h-12 bg-muted/40 rounded-xl" />
            <div className="h-12 bg-muted/40 rounded-xl" />
            <div className="h-12 bg-muted/40 rounded-xl" />
            <div className="h-12 bg-muted/40 rounded-xl" />
          </div>
          <div className="h-12 bg-muted/50 rounded-full mt-4" />
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const fade = (ms: number): CSSProperties => ({
    "--fade-delay": `${ms}ms`,
  }) as CSSProperties;

  return (
    <main className="relative min-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <MotionObserver />
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_110%)] opacity-20" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <Container className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 py-12 lg:py-20">
          {/* Left Column - Hero Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6" data-animate="fade-up" style={fade(100)}>
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden ring-1 ring-border shadow-premium-xl">
                <Image
                  src="/headshot/headshot.jpg"
                  alt="Shreyash Gupta"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Name & Title */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-serif text-foreground">
                Shreyash Gupta
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                Data Scientist, Software Engineer, and Tech Enthusiast
              </p>
            </div>

            {/* Project Quick Links */}
            <div className="flex flex-col gap-2 text-sm">
              <a href="https://convertshift.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-foreground font-medium">ConvertShift</span> — compress & convert images locally
              </a>
              <a href="https://github.com/shreyashguptas/prusa-camera-setup" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-foreground font-medium">Prusa Camera</span> — stream 3D prints to Prusa Connect
              </a>
              <a href="https://github.com/shreyashguptas/timelapse-creator" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-foreground font-medium">Timelapse Creator</span> — turn print frames into videos
              </a>
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="flex-1 w-full max-w-2xl" data-animate="fade-up" style={fade(200)}>
            <div className="relative">
              {/* Chat container with premium styling - deferred backdrop blur for better LCP */}
              <div className="relative rounded-2xl border border-border/50 bg-card/80 animate-blur-in shadow-premium-xl p-6">
                <InlineChat />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
