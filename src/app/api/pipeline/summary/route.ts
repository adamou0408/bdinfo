// Spec: specs/market-development-tool/spec.md — US-MD-003
// Task: specs/market-development-tool/tasks.md — Task 7

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  const grouped = await prisma.lead.groupBy({
    by: ["pipelineStage"],
    _count: { id: true },
  });

  const stages: Record<string, number> = {
    discovered: 0,
    contacted: 0,
    communicating: 0,
    proposed: 0,
    closed_won: 0,
    closed_lost: 0,
  };

  for (const group of grouped) {
    stages[group.pipelineStage] = group._count.id;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const followUpNeeded = await prisma.lead.count({
    where: {
      pipelineStage: { notIn: ["closed_won", "closed_lost"] },
      OR: [
        { lastInteractionAt: null },
        { lastInteractionAt: { lt: sevenDaysAgo } },
      ],
    },
  });

  return NextResponse.json({
    stages,
    follow_up_needed: followUpNeeded,
  });
}
