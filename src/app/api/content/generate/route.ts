// Spec: specs/market-development-tool/spec.md — US-MD-002
// Task: specs/market-development-tool/tasks.md — Task 6

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserId } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { contentGenerateSchema } from "@/lib/validations";
import contentGeneratorService from "@/services/content-generator";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "無效的 JSON" }, { status: 400 });
  }

  const parsed = contentGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "驗證失敗", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { content_type, target_industry, topic, tone } = parsed.data;

  const generated = await contentGeneratorService.generateContent({
    contentType: content_type,
    targetIndustry: target_industry,
    topic,
    tone,
  });

  const content = await prisma.content.create({
    data: {
      title: generated.title,
      body: generated.body,
      contentType: content_type,
      targetIndustry: target_industry,
      status: "draft",
      aiGenerated: true,
    },
  });

  const userId = getUserId(session!);
  await logAudit({
    userId,
    action: "content.generate",
    resourceType: "content",
    resourceId: content.id,
    details: { content_type, target_industry, topic },
  });

  return NextResponse.json(content, { status: 201 });
}
