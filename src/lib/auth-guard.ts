// Spec: specs/market-development-tool/spec.md — Security Requirements (RBAC)
// Task: specs/market-development-tool/tasks.md — Task 3

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type Role = "admin" | "market_developer" | "viewer";

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: NextResponse.json({ error: "未認證" }, { status: 401 }), session: null };
  }

  const userRole = (session.user as { role: string }).role as Role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return { error: NextResponse.json({ error: "無權限" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUserId(session: any): string {
  return session?.user?.id ?? "";
}
