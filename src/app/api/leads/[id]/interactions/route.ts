// Spec: specs/market-development-tool/spec.md — US-MD-003
// Task: specs/market-development-tool/tasks.md — Task 5

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { interactionCreateSchema } from "@/lib/validations";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { error, session } = await requireAuth(["admin", "market_developer"]);
    if (error) return error;

    const { id: leadId } = params;
    const body = await request.json();
    const validated = interactionCreateSchema.parse(body);

    // Verify the lead exists
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const userId = getUserId(session!);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 12);

    // Create the interaction and update the lead in a transaction
    const [interaction] = await prisma.$transaction([
      prisma.interaction.create({
        data: {
          leadId,
          type: validated.type,
          channel: validated.channel ?? null,
          summary: validated.summary ?? null,
          result: validated.result ?? null,
          createdBy: userId,
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: {
          lastInteractionAt: now,
          expiresAt,
        },
      }),
    ]);

    await logAudit({
      userId,
      action: "create_interaction",
      resourceType: "interaction",
      resourceId: interaction.id,
      details: { leadId, type: validated.type },
    });

    return NextResponse.json({ data: interaction }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: err }, { status: 400 });
    }
    console.error("POST /api/leads/[id]/interactions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
