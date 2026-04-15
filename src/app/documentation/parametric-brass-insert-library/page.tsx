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
  const documentationPath = path.join(process.cwd(), "documentation", "brass-insert-documentation.md");

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
      canonical: absoluteUrl("/documentation/parametric-brass-insert-library"),
    },
    openGraph: {
      type: "article",
      url: absoluteUrl("/documentation/parametric-brass-insert-library"),
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

export default async function ParametricBrassInsertLibraryPage() {
  const documentation = getDocumentation();

  if (!documentation) {
    return notFound();
  }

  const htmlContent = await markdownToHtml(documentation.content);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <Header />
        <article className="mb-32">
          <PostTitle>{documentation.title}</PostTitle>
          <PostBody content={htmlContent} />
        </article>
      </Container>
    </main>
  );
}
