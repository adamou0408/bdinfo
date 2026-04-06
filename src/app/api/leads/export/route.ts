// Spec: specs/market-development-tool/spec.md — US-MD-003
// Task: specs/market-development-tool/tasks.md — Task 5

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Build CSV — intentionally omit contactInfo for privacy
    const headers = ["company_name", "industry", "scale", "pipeline_stage", "source", "created_at"];
    const rows = leads.map((lead: typeof leads[number]) =>
      [
        escapeCsvField(lead.companyName),
        escapeCsvField(lead.industry),
        escapeCsvField(lead.scale),
        escapeCsvField(lead.pipelineStage),
        escapeCsvField(lead.source),
        escapeCsvField(lead.createdAt.toISOString()),
      ].join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");

    await logAudit({
      userId: getUserId(session!),
      action: "export_leads",
      resourceType: "lead",
      details: { totalExported: leads.length },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads-export.csv"',
      },
    });
  } catch (err) {
    console.error("GET /api/leads/export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
