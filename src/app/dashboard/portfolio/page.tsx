// Spec: specs/market-development-tool/spec.md — US-PC-002
// Task: specs/market-development-tool/tasks.md — Task 8

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PortfolioCase {
  id: string;
  title: string;
  clientIndustry: string | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  results: string | null;
  testimonial: string | null;
  isPublic: boolean;
  displayOrder: number;
}

export default function PortfolioManagePage() {
  const { status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState<PortfolioCase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    clientIndustry: "",
    problemDescription: "",
    solutionDescription: "",
    results: "",
    testimonial: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchCases = async () => {
    const res = await fetch("/api/portfolio");
    if (res.ok) {
      const data = await res.json();
      setCases(data.cases || []);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchCases();
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: "", clientIndustry: "", problemDescription: "", solutionDescription: "", results: "", testimonial: "" });
      await fetchCases();
    }
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700">← 返回</button>
            <h1 className="text-xl font-bold text-gray-900">案例管理</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            新增案例
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-4">
            <input type="text" required placeholder="案例標題" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input type="text" placeholder="客戶產業" value={form.clientIndustry} onChange={(e) => setForm({ ...form, clientIndustry: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <textarea placeholder="問題描述" value={form.problemDescription} onChange={(e) => setForm({ ...form, problemDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
            <textarea placeholder="解決方案" value={form.solutionDescription} onChange={(e) => setForm({ ...form, solutionDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
            <input type="text" placeholder="成果數據" value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <textarea placeholder="客戶證言" value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">儲存</button>
          </form>
        )}
        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium">{c.title}</h3>
              {c.clientIndustry && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{c.clientIndustry}</span>}
              {c.problemDescription && <p className="text-sm text-gray-600 mt-2"><strong>問題：</strong>{c.problemDescription}</p>}
              {c.solutionDescription && <p className="text-sm text-gray-600"><strong>方案：</strong>{c.solutionDescription}</p>}
              {c.results && <p className="text-sm text-green-600"><strong>成果：</strong>{c.results}</p>}
              {c.testimonial && <blockquote className="text-sm text-gray-500 italic mt-2 border-l-2 border-gray-200 pl-3">&ldquo;{c.testimonial}&rdquo;</blockquote>}
            </div>
          ))}
          {cases.length === 0 && <p className="text-center py-8 text-gray-400">尚無案例，點擊「新增案例」開始</p>}
        </div>
      </main>
    </div>
  );
}
