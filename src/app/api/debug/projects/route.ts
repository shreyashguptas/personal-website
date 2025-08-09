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
    // Minimal server log to help diagnose prod vs dev ordering/contents
    console.log("[Debug] projectsTop5 snapshot:", snapshot);

    return NextResponse.json({
      environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV,
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
      cwd: process.cwd(),
      projectsTop5: snapshot,
    });
  } catch (error: any) {
    console.error("[Debug] error reading projects:", error?.message);
    return NextResponse.json(
      {
        environment: process.env.VERCEL ? "vercel" : process.env.NODE_ENV,
        error: error?.message || String(error),
        cwd: process.cwd(),
      },
      { status: 500 }
    );
  }
}


