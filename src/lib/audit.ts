// Spec: specs/market-development-tool/spec.md — Security Requirements (Audit)
// Task: specs/market-development-tool/tasks.md — Task 10

import prisma from "@/lib/prisma";

export async function logAudit({
  userId,
  action,
  resourceType,
  resourceId,
  details,
  ipAddress,
}: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      details: details ?? undefined,
      ipAddress,
    },
  });
}
