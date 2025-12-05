import Container from "@/app/_components/container";
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
        <div className="flex-1 flex flex-col" data-animate="fade-up" style={fade(100)}>
          <InlineChat />
        </div>
      </Container>
    </main>
  );
}
