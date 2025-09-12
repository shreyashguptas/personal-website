import Container from "@/app/_components/container";
import Image from "next/image";
import { InlineChat } from "@/app/_components/inline-chat";

export default function HomePage() {
  // Removed content listings to focus on a clean chat-first landing
  return (
    <main className="relative">
      <Container>
        <div className="mt-10 desktop:grid desktop:grid-cols-[minmax(320px,520px)_1fr] desktop:gap-8 desktop:items-center">
          {/* Left column: image and name, centered vertically on desktop */}
          <div className="flex flex-col items-start desktop:justify-center desktop:min-h-[60vh]">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 rounded-lg overflow-hidden">
              <Image
                src="/headshot/headshot.jpg"
                alt="Shreyash Gupta"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-tight text-left">
              Shreyash Gupta.
            </h1>
            {/* Footer now contains links; nothing else here */}
          </div>

          {/* Right column: chat. Let natural height determine footer spacing; keep input visible inside. */}
          <div className="mt-6 desktop:mt-0">
            <InlineChat />
          </div>
        </div>
      </Container>
    </main>
  );
}
