// Spec: specs/market-development-tool/spec.md — US-MD-002
// Task: specs/market-development-tool/tasks.md — Task 6

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error, session } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  const content = await prisma.content.findUnique({
    where: { id: params.id },
  });

  if (!content) {
    return NextResponse.json({ error: "內容不存在" }, { status: 404 });
  }

  if (content.status !== "approved") {
    return NextResponse.json(
      { error: "只有已審核通過的內容才能發布", currentStatus: content.status },
      { status: 400 },
    );
  }

  // In production, this would call social media platform APIs (Facebook, LinkedIn, etc.)
  // For now, we simply update the status and publishedAt timestamp.
  const published = await prisma.content.update({
    where: { id: params.id },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });

  const userId = getUserId(session as { user: { id?: string } });
  await logAudit({
    userId,
    action: "content.publish",
    resourceType: "content",
    resourceId: params.id,
    details: { platform: content.platform },
  });

  return NextResponse.json(published);
}
