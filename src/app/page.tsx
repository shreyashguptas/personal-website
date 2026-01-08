import Container from "@/app/_components/container";
import { MotionObserver } from "@/app/_components/motion-observer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        
        {/* Premium green glow accents */}
        <div className="absolute top-0 right-1/4 h-[40rem] w-[40rem] rounded-full bg-[hsl(142_76%_36%)] opacity-[0.08] blur-[120px] animate-soft-glow" aria-hidden="true" />
        <div
          className="absolute bottom-0 left-1/4 h-[35rem] w-[35rem] rounded-full bg-[hsl(142_70%_45%)] opacity-[0.06] blur-[100px] animate-soft-glow"
          style={{ animationDelay: "-3s" }}
          aria-hidden="true"
        />
      </div>

      <Container className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 py-12 lg:py-20">
          {/* Left Column - Hero Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6" data-animate="fade-up" style={fade(100)}>
            {/* Profile Image */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-[hsl(142_76%_36%)] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden ring-2 ring-[hsl(var(--primary))]/20 shadow-premium-xl">
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-foreground">Shreyash </span>
                <span className="text-gradient-green">Gupta</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                Data Scientist, Software Engineer, and Tech Enthusiast
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02] transition-all duration-200"
              >
                Read Blog
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm font-medium hover:bg-accent/50 hover:border-[hsl(var(--primary))]/30 transition-all duration-200"
              >
                View Projects
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Description */}
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Building software solutions, writing about technology, and exploring the intersection of 
              data science and engineering. Passionate about home labs, infrastructure, and continuous learning.
            </p>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="flex-1 w-full max-w-2xl" data-animate="fade-up" style={fade(200)}>
            <div className="relative">
              {/* Chat container with premium styling - deferred backdrop blur for better LCP */}
              <div className="relative rounded-2xl border border-border/40 bg-card/80 animate-blur-in shadow-premium-xl p-6 border-[hsl(var(--primary))]/10">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/5 via-transparent to-transparent pointer-events-none" />
                <InlineChat />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
