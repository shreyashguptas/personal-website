import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/api";

// Force this route to execute at request time in prod to reflect current filesystem
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = getAllProjects().map((p) => ({
      title: p.title,
      date: p.date,
      slug: p.slug,
    }));

    const snapshot = projects.slice(0, 5);

    return NextResponse.json({
      environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV,
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
      cwd: process.cwd(),
      projectsTop5: snapshot,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Debug] error reading projects:", errorMessage);
    return NextResponse.json(
      {
        environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV,
        error: errorMessage,
        cwd: process.cwd(),
      },
      { status: 500 }
    );
  }
}


