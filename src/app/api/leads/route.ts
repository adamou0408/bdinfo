// Spec: specs/market-development-tool/spec.md — US-MD-001
// Task: specs/market-development-tool/tasks.md — Task 5

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { leadQuerySchema } from "@/lib/validations";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const query = leadQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, industry, pipeline_stage, search, sort_by } = query;

    // Build Prisma where clause
    const where: Record<string, unknown> = {};
    if (industry) {
      where.industry = industry;
    }
    if (pipeline_stage) {
      where.pipelineStage = pipeline_stage;
    }
    if (search) {
      where.companyName = { contains: search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [sort_by === "last_interaction_at" ? "lastInteractionAt" : "createdAt"]: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    await logAudit({
      userId: getUserId(session!),
      action: "list_leads",
      resourceType: "lead",
      details: { query },
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid query parameters", details: err }, { status: 400 });
    }
    console.error("GET /api/leads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const body = await request.json();

    const lead = await prisma.lead.create({
      data: {
        companyName: body.companyName,
        industry: body.industry ?? null,
        scale: body.scale ?? null,
        contactInfo: body.contactInfo ?? null,
        source: body.source,
        sourceUrl: body.sourceUrl ?? null,
        digitalMaturity: body.digitalMaturity ?? null,
        pipelineStage: body.pipeline_stage ?? "discovered",
        tags: body.tags ?? [],
      },
    });

    await logAudit({
      userId: getUserId(session!),
      action: "create_lead",
      resourceType: "lead",
      resourceId: lead.id,
      details: { companyName: lead.companyName },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (err) {
    console.error("POST /api/leads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
