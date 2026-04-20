import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing | Shreyash Gupta",
  description: "Essays and notes by Shreyash Gupta.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/blog"),
    title: "Writing | Shreyash Gupta",
    description: "Essays and notes by Shreyash Gupta.",
  },
  twitter: {
    card: "summary",
    title: "Writing | Shreyash Gupta",
    description: "Essays and notes by Shreyash Gupta.",
  },
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);

  return (
    <Container className="animate-fade-in">
      <Intro
        eyebrow="The Writing"
        title="Essays and notes."
        description="Writing on software, data, and the craft of building things."
      />
      {heroPost && (
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
      )}
      {morePosts.length > 0 && <MoreStories posts={morePosts} />}
    </Container>
  );
}
