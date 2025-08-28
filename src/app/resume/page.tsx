import Container from "@/app/_components/container";
import type { Metadata } from "next";
import { PostBody } from "@/app/_components/post-body";
import markdownToHtml from "@/lib/markdownToHtml";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const metadata: Metadata = {
  title: "Resume | Shreyash Gupta",
  description: "Professional resume and work experience of Shreyash Gupta.",
  alternates: { canonical: "/resume" },
  openGraph: {
    type: "website",
    url: "/resume",
    title: "Resume | Shreyash Gupta",
    description: "Professional resume and work experience of Shreyash Gupta.",
  },
  twitter: {
    card: "summary",
    title: "Resume | Shreyash Gupta",
    description: "Professional resume and work experience of Shreyash Gupta.",
  },
};

export default async function ResumePage() {
  // Read the resume markdown file directly
  const resumePath = path.join(process.cwd(), "_resume", "resume.md");
  
  if (!fs.existsSync(resumePath)) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Container>
          <div className="mt-16 relative z-10">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
              Resume.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-8">
              Resume file not found. Please check back later.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  const resumeContent = fs.readFileSync(resumePath, "utf8");
  const { content } = matter(resumeContent);

  // Convert markdown content to HTML
  const htmlContent = await markdownToHtml(content);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <div className="mt-16 relative z-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
            Resume.
          </h1>
          
          <div className="mt-12">
            <PostBody content={htmlContent} />
          </div>
        </div>
      </Container>
    </main>
  );
}
