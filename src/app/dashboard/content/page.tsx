// Spec: specs/market-development-tool/spec.md — US-MD-002
// Task: specs/market-development-tool/tasks.md — Task 6

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ContentItem {
  id: string;
  title: string;
  body: string;
  contentType: string;
  status: string;
  platform: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "草稿",
  pending_review: "待審核",
  approved: "已核准",
  published: "已發布",
  archived: "已封存",
};

const typeLabels: Record<string, string> = {
  case_study: "案例分享",
  industry_insight: "產業洞察",
  tech_guide: "技術科普",
  success_story: "成功故事",
};

export default function ContentPage() {
  const { status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({
    content_type: "industry_insight",
    target_industry: "傳統產業",
    topic: "",
    tone: "專業但易懂",
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchContent = async () => {
    const res = await fetch("/api/content");
    if (res.ok) {
      const data = await res.json();
      setContents(data.data || []);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchContent();
  }, [status]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const res = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(genForm),
    });
    if (res.ok) {
      setShowGenerate(false);
      setGenForm({ ...genForm, topic: "" });
      await fetchContent();
    }
    setGenerating(false);
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700">
              ← 返回
            </button>
            <h1 className="text-xl font-bold text-gray-900">內容工作台</h1>
          </div>
          <button
            onClick={() => setShowGenerate(!showGenerate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            AI 產生內容
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {showGenerate && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">AI 產生社群內容</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">內容類型</label>
                  <select
                    value={genForm.content_type}
                    onChange={(e) => setGenForm({ ...genForm, content_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目標產業</label>
                  <input
                    type="text"
                    value={genForm.target_industry}
                    onChange={(e) => setGenForm({ ...genForm, target_industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主題</label>
                <input
                  type="text"
                  required
                  value={genForm.topic}
                  onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })}
                  placeholder="例如：傳統製造業導入 AI 品檢的效益"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "產生中..." : "產生內容"}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {contents.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    {typeLabels[item.contentType] || item.contentType}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3">{item.body}</p>
              <div className="mt-3 text-xs text-gray-400">
                {item.aiGenerated && "🤖 AI 產生"}
                {item.scheduledAt && ` · 排程：${new Date(item.scheduledAt).toLocaleString("zh-TW")}`}
                {item.publishedAt && ` · 已發布：${new Date(item.publishedAt).toLocaleString("zh-TW")}`}
              </div>
            </div>
          ))}
          {contents.length === 0 && (
            <div className="text-center py-12 text-gray-400">尚無內容，點擊「AI 產生內容」開始</div>
          )}
        </div>
      </main>
    </div>
  );
}
