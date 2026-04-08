// Spec: specs/market-development-tool/spec.md — Security Requirements
// Task: specs/market-development-tool/tasks.md — Task 3

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
