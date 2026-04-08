// Spec: specs/market-development-tool/spec.md — US-MD-004
// Task: specs/market-development-tool/tasks.md — Task 12

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface InsightReport {
  id: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  summary: string | null;
  data: {
    top_industries?: string[];
    trend?: string;
    new_leads_count?: number;
    hot_topics?: string[];
  };
  createdAt: string;
}

export default function InsightsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [latest, setLatest] = useState<InsightReport | null>(null);
  const [reports, setReports] = useState<InsightReport[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/insights/latest").then((r) => r.ok ? r.json() : null).then(setLatest).catch(() => {});
      fetch("/api/insights").then((r) => r.ok ? r.json() : { data: [] }).then((d) => setReports(d.data || [])).catch(() => {});
    }
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700">
            ← 返回
          </button>
          <h1 className="text-xl font-bold text-gray-900">市場洞察</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {latest ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">最新週報</h2>
            <p className="text-sm text-gray-500 mb-4">
              {latest.periodStart} ~ {latest.periodEnd}
            </p>
            {latest.summary && <p className="text-gray-700 mb-4">{latest.summary}</p>}
            {latest.data?.top_industries && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">熱門產業：</span>
                <span className="text-sm text-gray-700">{latest.data.top_industries.join("、")}</span>
              </div>
            )}
            {latest.data?.hot_topics && (
              <div className="flex gap-2 flex-wrap">
                {latest.data.hot_topics.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600">{t}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center text-gray-400">
            尚無市場洞察報告。系統將每週自動產生。
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">歷史報告</h2>
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between">
                <span className="font-medium">{r.periodStart} ~ {r.periodEnd}</span>
                <span className="text-xs text-gray-400">{r.reportType}</span>
              </div>
              {r.summary && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.summary}</p>}
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-center py-8 text-gray-400">尚無歷史報告</p>
          )}
        </div>
      </main>
    </div>
  );
}
