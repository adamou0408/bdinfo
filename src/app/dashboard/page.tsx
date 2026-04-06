// Spec: specs/market-development-tool/spec.md — US-MD-003, US-MD-004
// Task: specs/market-development-tool/tasks.md — Task 13

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PipelineSummary {
  stages: Record<string, number>;
  follow_up_needed: number;
}

const stageLabels: Record<string, string> = {
  discovered: "發現",
  contacted: "已接觸",
  communicating: "溝通中",
  proposed: "已提案",
  closed_won: "成交",
  closed_lost: "未成交",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pipeline, setPipeline] = useState<PipelineSummary | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pipeline/summary")
        .then((r) => r.json())
        .then(setPipeline)
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") return <div className="p-8">載入中...</div>;
  if (!session) return null;

  const navItems = [
    { href: "/dashboard/leads", label: "潛在客戶", icon: "👥" },
    { href: "/dashboard/content", label: "內容工作台", icon: "📝" },
    { href: "/dashboard/insights", label: "市場洞察", icon: "📊" },
    { href: "/dashboard/portfolio", label: "案例管理", icon: "💼" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">市場開拓工具</h1>
          <span className="text-sm text-gray-500">{session.user?.name || session.user?.email}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-gray-700">{item.label}</div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">銷售管道概覽</h2>
          {pipeline ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(stageLabels).map(([key, label]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {pipeline.stages[key] || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">載入中...</p>
          )}
        </div>

        {pipeline && pipeline.follow_up_needed > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ 有 <strong>{pipeline.follow_up_needed}</strong> 位客戶需要跟進
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
