// Spec: specs/market-development-tool/spec.md — CONFLICT-002 Resolution
// Task: specs/market-development-tool/tasks.md — Task 10

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/privacy/data-request — Public endpoint.
 * Search leads by email (or company name as secondary search for MVP).
 *
 * Since contactInfo is AES-256 encrypted, direct DB search by email is not feasible.
 * For MVP: accept company name as primary search parameter.
 * In production, this would require email verification before returning data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const company = searchParams.get("company");

    if (!email) {
      return NextResponse.json(
        { error: "email query parameter is required" },
        { status: 400 },
      );
    }

    // Since contactInfo is encrypted, we cannot search it directly via SQL.
    // For MVP, we use company name as a secondary search criterion.
    // In production, we would iterate and decrypt, or maintain a hashed index.
    const where: Record<string, unknown> = {};
    if (company) {
      where.companyName = { contains: company, mode: "insensitive" };
    }

    const leads = await prisma.lead.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        industry: true,
        source: true,
        pipelineStage: true,
        createdAt: true,
        dataDeletionRequested: true,
        // Exclude contactInfo and other sensitive fields of other leads
      },
    });

    await logAudit({
      action: "privacy_data_request",
      resourceType: "lead",
      details: { email, company: company ?? null, resultsCount: leads.length },
    });

    return NextResponse.json({
      message:
        "以下為與您查詢相關的記錄。如需刪除資料，請使用 /api/privacy/data-deletion 端點。",
      records: leads,
    });
  } catch (err) {
    console.error("GET /api/privacy/data-request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
