// Spec: specs/market-development-tool/spec.md — US-MD-002
// Task: specs/market-development-tool/tasks.md — Task 6

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth(["admin", "market_developer"]);
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || undefined;
  const contentType = searchParams.get("content_type") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }
  if (contentType) {
    where.contentType = contentType;
  }

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
