import Container from "@/app/_components/container";
import { MinimalPostPreview } from "@/app/_components/minimal-post-preview";
import { MinimalProjectHighlight } from "@/app/_components/minimal-project-highlight";
import { MinimalNavigation } from "@/app/_components/minimal-navigation";
import { SocialLinks } from "@/app/_components/social-links";
import { getAllPosts, getAllProjects } from "@/lib/api";
import Image from "next/image";

// Configure which project to feature by changing this name to match any project title from _projects
const FEATURED_PROJECT_NAME = "Congressional Bill Tracker";

export default function HomePage() {
  const allPosts = getAllPosts();
  const allProjects = getAllProjects();
  
  // Get the latest post and featured project
  const latestPost = allPosts[0];
  const featuredProject = allProjects.find(p => p.title === FEATURED_PROJECT_NAME) || allProjects[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <div className="mt-16 relative z-10">
          {/* Mobile: Image above title */}
          <div className="md:hidden mb-8">
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
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight text-left mb-16">
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
      </Container>
      
      {/* Desktop: Right-side headshot image with full height */}
      <div className="hidden md:block absolute top-0 right-0 h-screen w-1/2 overflow-hidden">
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
