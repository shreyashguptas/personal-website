import Container from "@/app/_components/container";
import type { Metadata } from "next";
import { PostBody } from "@/app/_components/post-body";
import { Intro } from "@/app/_components/intro";
import markdownToHtml from "@/lib/markdownToHtml";
import { absoluteUrl } from "@/lib/seo";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const metadata: Metadata = {
  title: "Resume | Shreyash Gupta",
  description: "Professional resume and work experience of Shreyash Gupta.",
  alternates: { canonical: absoluteUrl("/resume") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/resume"),
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
  const resumePath = path.join(process.cwd(), "_resume", "resume.md");

  if (!fs.existsSync(resumePath)) {
    return (
      <Container className="animate-fade-in">
        <Intro
          eyebrow="Resume"
          title="Resume"
          description="Resume file not found. Please check back later."
        />
      </Container>
    );
  }

  const resumeContent = fs.readFileSync(resumePath, "utf8");
  const { content } = matter(resumeContent);
  const htmlContent = await markdownToHtml(content);

  return (
    <Container className="animate-fade-in">
      <Intro
        eyebrow="Resume"
        title="The working résumé."
        description="Roles, tools, and the shape of the work. Last updated as of this build."
      />
      <div className="py-10 md:py-14">
        <PostBody content={htmlContent} />
      </div>
    </Container>
  );
}
