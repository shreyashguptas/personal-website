import Container from "@/app/_components/container";
import { MinimalNavigation } from "@/app/_components/minimal-navigation";
import { SocialLinks } from "@/app/_components/social-links";
import Image from "next/image";
import { InlineChat } from "@/app/_components/inline-chat";

export default function HomePage() {
  // Removed content listings to focus on a clean chat-first landing

  return (
    <main className="relative min-h-screen">
      <Container>
        <div className="mt-10 desktop:grid desktop:grid-cols-[minmax(320px,520px)_1fr] desktop:gap-8">
          {/* Left column: image and name, left-aligned */}
          <div className="flex flex-col items-start">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg overflow-hidden">
              <Image
                src="/headshot/headshot.jpg"
                alt="Shreyash Gupta"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight text-left">
              Shreyash Gupta.
            </h1>
            {/* Footer now contains links; nothing else here */}
          </div>

          {/* Right column: chat. Let natural height determine footer spacing; keep input visible inside. */}
          <div className="mt-10 desktop:mt-0">
            <InlineChat />
          </div>
        </div>
      </Container>
    </main>
  );
}
