import Container from "@/app/_components/container";
import { getResumeInfo } from "@/lib/rag";
import { loadIndex } from "@/lib/rag";
import type { Metadata } from "next";

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

export default function ResumePage() {
  const index = loadIndex();
  const resumeInfo = getResumeInfo(index);

  if (!resumeInfo) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Container>
          <div className="mt-16 relative z-10">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
              Resume.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-8">
              Resume information not available. Please check back later.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container>
        <div className="mt-16 relative z-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight">
            Resume.
          </h1>
          
          <div className="mt-12 prose prose-lg dark:prose-invert max-w-none">
            <div 
              className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border"
              dangerouslySetInnerHTML={{ __html: resumeInfo.text.replace(/\n/g, '<br/>') }}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
