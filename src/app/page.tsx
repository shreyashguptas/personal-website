import Container from "@/app/_components/container";
import { MinimalPostPreview } from "@/app/_components/minimal-post-preview";
import { MinimalProjectHighlight } from "@/app/_components/minimal-project-highlight";
import { MinimalNavigation } from "@/app/_components/minimal-navigation";
import { SocialLinks } from "@/app/_components/social-links";
import { getAllPosts, getAllProjects } from "@/lib/api";
import Image from "next/image";

export default function HomePage() {
  const allPosts = getAllPosts();
  const allProjects = getAllProjects();
  
  // Get the latest post and featured project
  const latestPost = allPosts[0];
  const featuredProject = allProjects[0];

  // Diagnostics (dev-only): Verify project ordering and chosen featured project
  if (process.env.NODE_ENV !== "production") {
    // Log the first few projects to confirm ordering (latest first)
    console.log(
      "[HomePage] Projects order (top 5):",
      allProjects.slice(0, 5).map((p) => ({ title: p.title, date: p.date }))
    );
    console.log(
      "[HomePage] Featured project:",
      featuredProject ? { title: featuredProject.title, date: featuredProject.date } : null
    );
  }

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
              {/* Latest blog post */}
              {latestPost && (
                <MinimalPostPreview post={latestPost} />
              )}
              
              {/* Featured project */}
              {featuredProject && (
                <MinimalProjectHighlight project={featuredProject} />
              )}
              
              {/* Minimal navigation */}
              <MinimalNavigation />
              
              {/* Social links */}
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
            <div className="max-w-md space-y-12">
              {/* Latest blog post */}
              {latestPost && (
                <MinimalPostPreview post={latestPost} />
              )}
              
              {/* Featured project */}
              {featuredProject && (
                <MinimalProjectHighlight project={featuredProject} />
              )}
              
              {/* Minimal navigation */}
              <MinimalNavigation />
              
              {/* Social links */}
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
