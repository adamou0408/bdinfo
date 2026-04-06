// Spec: specs/market-development-tool/spec.md — Security Requirements
// Task: specs/market-development-tool/tasks.md — Task 3

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
