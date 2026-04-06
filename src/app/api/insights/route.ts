// Spec: specs/market-development-tool/spec.md — US-MD-004
// Task: specs/market-development-tool/tasks.md — Task 12

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

/**
 * GET /api/insights — Auth required (admin, market_developer).
 * List insight reports with optional report_type filter, ordered by periodEnd desc.
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("report_type");

    const where: Record<string, unknown> = {};
    if (reportType) {
      where.reportType = reportType;
    }

    const insights = await prisma.insight.findMany({
      where,
      orderBy: { periodEnd: "desc" },
    });

    return NextResponse.json({ data: insights });
  } catch (err) {
    console.error("GET /api/insights error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
