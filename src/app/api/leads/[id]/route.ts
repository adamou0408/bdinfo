// Spec: specs/market-development-tool/spec.md — US-MD-001, US-MD-003
// Task: specs/market-development-tool/tasks.md — Task 5

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { leadUpdateSchema } from "@/lib/validations";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import { decryptContactInfo } from "@/lib/encryption";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const { id } = params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { interactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Decrypt contact info for the response
    let decryptedContactInfo: Record<string, unknown> | null = null;
    if (lead.contactInfo) {
      try {
        decryptedContactInfo = decryptContactInfo(lead.contactInfo);
      } catch {
        decryptedContactInfo = null;
      }
    }

    await logAudit({
      userId: getUserId(session!),
      action: "view_lead",
      resourceType: "lead",
      resourceId: id,
    });

    return NextResponse.json({
      data: {
        ...lead,
        contactInfo: decryptedContactInfo,
      },
    });
  } catch (err) {
    console.error("GET /api/leads/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const { id } = params;
    const body = await request.json();
    const validated = leadUpdateSchema.parse(body);

    // Fetch current lead to detect pipeline stage change
    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (validated.pipeline_stage !== undefined) {
      updateData.pipelineStage = validated.pipeline_stage;
    }
    if (validated.tags !== undefined) {
      updateData.tags = validated.tags;
    }
    if (validated.companyName !== undefined) {
      updateData.companyName = validated.companyName;
    }
    if (validated.industry !== undefined) {
      updateData.industry = validated.industry;
    }
    if (validated.scale !== undefined) {
      updateData.scale = validated.scale;
    }

    // If pipeline_stage transitions to "contacted" for the first time,
    // set a reminder to send privacy notice
    if (
      validated.pipeline_stage === "contacted" &&
      existingLead.pipelineStage === "discovered" &&
      !existingLead.privacyNoticeSent
    ) {
      updateData.privacyNoticeSent = false; // Flag stays false as a reminder to send it
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: getUserId(session!),
      action: "update_lead",
      resourceType: "lead",
      resourceId: id,
      details: {
        changes: validated,
        previousStage: existingLead.pipelineStage,
      },
    });

    return NextResponse.json({ data: updatedLead });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: err }, { status: 400 });
    }
    console.error("PATCH /api/leads/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
