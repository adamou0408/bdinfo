// Spec: specs/market-development-tool/spec.md — US-MD-003
// Task: specs/market-development-tool/tasks.md — Task 7

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const daysInactive = Math.max(
    1,
    parseInt(searchParams.get("days_inactive") || "7", 10),
  );

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  const leads = await prisma.lead.findMany({
    where: {
      pipelineStage: { notIn: ["closed_won", "closed_lost"] },
      OR: [
        { lastInteractionAt: null },
        { lastInteractionAt: { lt: cutoffDate } },
      ],
    },
    orderBy: { lastInteractionAt: "asc" },
  });

  return NextResponse.json(leads);
}
