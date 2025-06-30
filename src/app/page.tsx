import Container from "@/app/_components/container";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <div className="mt-16 relative z-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
            Shreyash Gupta.
          </h1>
        </div>
      </Container>
      
      {/* Desktop: Right-side headshot image with half-cutoff effect */}
      <div className="hidden md:block absolute top-0 right-0 h-screen w-1/2 overflow-hidden">
        <div className="relative h-full w-full translate-x-[45%]">
          <Image
            src="/headshot/headshot.jpg"
            alt="Shreyash Gupta"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      {/* Mobile: Background image with overlay */}
      <div className="md:hidden absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image
            src="/headshot/headshot.jpg"
            alt="Shreyash Gupta"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
    </main>
  );
}
