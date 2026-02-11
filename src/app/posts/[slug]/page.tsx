import { Metadata } from "next";
import Script from "next/script";
import { absoluteUrl } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";

export const dynamicParams = false;

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <Header />
        <article className="mb-32">
          {post && (
            <Script id="post-jsonld" type="application/ld+json" strategy="afterInteractive">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.title,
                datePublished: post.date,
                dateModified: post.date,
                author: {
                  "@type": "Person",
                  name: post.author?.name || "Shreyash Gupta",
                },
              })}
            </Script>
          )}
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
          />
          <PostBody content={content} />
        </article>
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Shreyash Gupta`;

  return {
    title,
    description: post.excerpt || undefined,
    alternates: {
      canonical: absoluteUrl(`/posts/${post.slug}`),
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/posts/${post.slug}`),
      title,
      description: post.excerpt || undefined,
      ...(post.coverImage && { images: [absoluteUrl(post.coverImage)!] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [absoluteUrl(post.coverImage)!] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
