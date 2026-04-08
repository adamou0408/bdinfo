// Spec: specs/market-development-tool/spec.md — US-MD-004
// Task: specs/market-development-tool/tasks.md — Task 12

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

/**
 * GET /api/insights/latest — Auth required.
 * Return the most recent weekly_summary insight report.
 */
export async function GET() {
  try {
    const { error } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const latest = await prisma.insight.findFirst({
      where: { reportType: "weekly_summary" },
      orderBy: { periodEnd: "desc" },
    });

    if (!latest) {
      return NextResponse.json({ error: "No weekly summary found" }, { status: 404 });
    }

    return NextResponse.json({ data: latest });
  } catch (err) {
    console.error("GET /api/insights/latest error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
