import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostTitle } from "@/app/_components/post-title";
import markdownToHtml from "@/lib/markdownToHtml";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

type DocumentationFrontMatter = {
  title?: string;
  description?: string;
};

function getDocumentation() {
  const documentationPath = path.join(process.cwd(), "documentation", "self-hosted-embeddings.md");

  if (!fs.existsSync(documentationPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(documentationPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontMatter = data as DocumentationFrontMatter;

  return {
    title: frontMatter.title || "Documentation",
    description: frontMatter.description || "Technical documentation.",
    content,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const documentation = getDocumentation();

  if (!documentation) {
    return {
      title: "Documentation | Shreyash Gupta",
    };
  }

  const title = `${documentation.title} | Shreyash Gupta`;

  return {
    title,
    description: documentation.description,
    alternates: {
      canonical: absoluteUrl("/documentation/self-hosted-embeddings"),
    },
    openGraph: {
      type: "article",
      url: absoluteUrl("/documentation/self-hosted-embeddings"),
      title,
      description: documentation.description,
    },
    twitter: {
      card: "summary",
      title,
      description: documentation.description,
    },
  };
}

export default async function SelfHostedEmbeddingsPage() {
  const documentation = getDocumentation();

  if (!documentation) {
    return notFound();
  }

  const htmlContent = await markdownToHtml(documentation.content);

  return (
    <Container className="animate-fade-in">
      <Header />
      <article className="py-10 md:py-14">
        <header className="border-b border-border pb-8 md:pb-12">
          <p className="label-eyebrow mb-5">Documentation</p>
          <PostTitle>{documentation.title}</PostTitle>
          {documentation.description && (
            <p className="mt-4 font-serif text-lg leading-relaxed text-muted-foreground max-w-2xl">
              {documentation.description}
            </p>
          )}
        </header>
        <div className="mt-10 md:mt-14">
          <PostBody content={htmlContent} />
        </div>
      </article>
    </Container>
  );
}
