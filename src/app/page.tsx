// Spec: specs/market-development-tool/spec.md
// Task: specs/market-development-tool/tasks.md — Task 1

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
