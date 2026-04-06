// Spec: specs/market-development-tool/spec.md — US-MD-001
// Task: specs/market-development-tool/tasks.md — Task 5

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  companyName: string;
  industry: string | null;
  scale: string | null;
  source: string;
  digitalMaturity: string | null;
  pipelineStage: string;
  lastInteractionAt: string | null;
  createdAt: string;
}

const stageLabels: Record<string, string> = {
  discovered: "發現",
  contacted: "已接觸",
  communicating: "溝通中",
  proposed: "已提案",
  closed_won: "成交",
  closed_lost: "未成交",
};

const stageColors: Record<string, string> = {
  discovered: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  communicating: "bg-yellow-100 text-yellow-700",
  proposed: "bg-purple-100 text-purple-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

export default function LeadsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (industryFilter) params.set("industry", industryFilter);
    if (stageFilter) params.set("pipeline_stage", stageFilter);

    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.data);
      setTotal(data.pagination.total);
    }
  }, [page, search, industryFilter, stageFilter]);

  useEffect(() => {
    if (status === "authenticated") fetchLeads();
  }, [status, fetchLeads]);

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
            <h1 className="text-xl font-bold text-gray-900">潛在客戶名單</h1>
          </div>
          <a href="/api/leads/export" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
            匯出 CSV
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="搜尋企業名稱..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">所有產業</option>
              <option value="製造業">製造業</option>
              <option value="農業">農業</option>
              <option value="營建業">營建業</option>
              <option value="物流業">物流業</option>
            </select>
            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">所有階段</option>
              {Object.entries(stageLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div className="text-sm text-gray-500 flex items-center">共 {total} 筆</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">企業名稱</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">產業</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">規模</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">來源</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">階段</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最後互動</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.companyName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{lead.industry || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{lead.scale || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{lead.source}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${stageColors[lead.pipelineStage] || ""}`}>
                      {stageLabels[lead.pipelineStage] || lead.pipelineStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {lead.lastInteractionAt
                      ? new Date(lead.lastInteractionAt).toLocaleDateString("zh-TW")
                      : "-"}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">尚無資料</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              上一頁
            </button>
            <span className="px-3 py-1 text-sm text-gray-500">第 {page} 頁</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
