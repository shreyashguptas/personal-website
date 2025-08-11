import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Shreyash Gupta",
  description: "Articles and notes by Shreyash Gupta.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Blog | Shreyash Gupta",
    description: "Articles and notes by Shreyash Gupta.",
  },
  twitter: {
    card: "summary",
    title: "Blog | Shreyash Gupta",
    description: "Articles and notes by Shreyash Gupta.",
  },
};

export default function BlogPage() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <Intro />
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </Container>
    </main>
  );
} 