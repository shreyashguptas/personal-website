import Container from "@/app/_components/container";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <div className="mt-16">
          <h3 className="text-2xl md:text-2xl font-bold tracking-tighter leading-tight">
            Hello, I'm
          </h3>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
            Shreyash Gupta
          </h1>
        </div>
      </Container>
      
      {/* Right-side headshot image with half-cutoff effect */}
      <div className="absolute top-0 right-0 h-screen w-1/2 overflow-hidden">
        <div className="relative h-full w-full translate-x-1/2">
          <Image
            src="/headshot/headshot.jpg"
            alt="Shreyash Gupta"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </main>
  );
}
