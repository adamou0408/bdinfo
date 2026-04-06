// Spec: specs/market-development-tool/spec.md — US-PC-002
// Task: specs/market-development-tool/tasks.md — Task 8

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { portfolioCaseSchema } from "@/lib/validations";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/portfolio — Public endpoint.
 * Returns all portfolio cases where isPublic=true, ordered by displayOrder.
 */
export async function GET() {
  try {
    const cases = await prisma.portfolioCase.findMany({
      where: { isPublic: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ cases });
  } catch (err) {
    console.error("GET /api/portfolio error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/portfolio — Auth required (admin, market_developer).
 * Create a new portfolio case. Validates with portfolioCaseSchema.
 */
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const body = await request.json();
    const parsed = portfolioCaseSchema.parse(body);

    const portfolioCase = await prisma.portfolioCase.create({
      data: {
        title: parsed.title,
        clientIndustry: parsed.clientIndustry ?? null,
        problemDescription: parsed.problemDescription ?? null,
        solutionDescription: parsed.solutionDescription ?? null,
        results: parsed.results ?? null,
        testimonial: parsed.testimonial ?? null,
        isPublic: parsed.isPublic,
        displayOrder: parsed.displayOrder,
      },
    });

    await logAudit({
      userId: getUserId(session!),
      action: "create_portfolio_case",
      resourceType: "portfolio_case",
      resourceId: portfolioCase.id,
      details: { title: portfolioCase.title },
    });

    return NextResponse.json({ data: portfolioCase }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request body", details: err }, { status: 400 });
    }
    console.error("POST /api/portfolio error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
