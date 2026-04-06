// Spec: specs/market-development-tool/spec.md — US-MD-002
// Task: specs/market-development-tool/tasks.md — Task 6

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { contentUpdateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  const content = await prisma.content.findUnique({
    where: { id: params.id },
  });

  if (!content) {
    return NextResponse.json({ error: "內容不存在" }, { status: 404 });
  }

  return NextResponse.json(content);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error, session } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  const existing = await prisma.content.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "內容不存在" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "無效的 JSON" }, { status: 400 });
  }

  const parsed = contentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "驗證失敗", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = {};

  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.body !== undefined) updateData.body = parsed.data.body;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.scheduled_at !== undefined) {
    updateData.scheduledAt = new Date(parsed.data.scheduled_at);
  }
  if (parsed.data.platform !== undefined) updateData.platform = parsed.data.platform;

  // When status changes to "published", set publishedAt
  if (parsed.data.status === "published" && existing.status !== "published") {
    updateData.publishedAt = new Date();
  }

  const updated = await prisma.content.update({
    where: { id: params.id },
    data: updateData,
  });

  const userId = getUserId(session!);
  await logAudit({
    userId,
    action: "content.update",
    resourceType: "content",
    resourceId: params.id,
    details: {
      fields: Object.keys(parsed.data),
      statusChange: parsed.data.status
        ? { from: existing.status, to: parsed.data.status }
        : undefined,
    },
  });

  return NextResponse.json(updated);
}
