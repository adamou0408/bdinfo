// Spec: specs/market-development-tool/spec.md — US-PC-002
// Task: specs/market-development-tool/tasks.md — Task 8

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/portfolio/[id] — Public endpoint.
 * Fetch a single portfolio case by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const portfolioCase = await prisma.portfolioCase.findUnique({
      where: { id: params.id },
    });

    if (!portfolioCase) {
      return NextResponse.json({ error: "Portfolio case not found" }, { status: 404 });
    }

    return NextResponse.json({ data: portfolioCase });
  } catch (err) {
    console.error("GET /api/portfolio/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/portfolio/[id] — Auth required (admin, market_developer).
 * Update an existing portfolio case.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const existing = await prisma.portfolioCase.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Portfolio case not found" }, { status: 404 });
    }

    const body = await request.json();

    // Only allow updating known fields
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.clientIndustry !== undefined) updateData.clientIndustry = body.clientIndustry;
    if (body.problemDescription !== undefined) updateData.problemDescription = body.problemDescription;
    if (body.solutionDescription !== undefined) updateData.solutionDescription = body.solutionDescription;
    if (body.results !== undefined) updateData.results = body.results;
    if (body.testimonial !== undefined) updateData.testimonial = body.testimonial;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    const updated = await prisma.portfolioCase.update({
      where: { id: params.id },
      data: updateData,
    });

    await logAudit({
      userId: getUserId(session!),
      action: "update_portfolio_case",
      resourceType: "portfolio_case",
      resourceId: updated.id,
      details: { updatedFields: Object.keys(updateData) },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PATCH /api/portfolio/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
