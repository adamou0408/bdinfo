// Spec: specs/market-development-tool/spec.md — US-PC-002
// Task: specs/market-development-tool/tasks.md — Task 8 (Public Portfolio)

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Case {
  id: string;
  title: string;
  clientIndustry: string | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  results: string | null;
  testimonial: string | null;
}

async function getCases(): Promise<Case[]> {
  return prisma.portfolioCase.findMany({
    where: { isPublic: true },
    orderBy: { displayOrder: "asc" },
  });
}

export default async function PublicPortfolioPage() {
  const cases = await getCases();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">服務案例</h1>
          <p className="mt-2 text-gray-600">AI 驅動的全端開發 · 企業系統升級 · 一條龍顧問服務</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {cases.map((c) => (
            <article key={c.id} className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900">{c.title}</h2>
              {c.clientIndustry && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600">
                  {c.clientIndustry}
                </span>
              )}
              {c.problemDescription && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">挑戰</h3>
                  <p className="mt-1 text-gray-700">{c.problemDescription}</p>
                </div>
              )}
              {c.solutionDescription && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">解決方案</h3>
                  <p className="mt-1 text-gray-700">{c.solutionDescription}</p>
                </div>
              )}
              {c.results && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium text-green-700 uppercase">成果</h3>
                  <p className="mt-1 text-green-800 font-medium">{c.results}</p>
                </div>
              )}
              {c.testimonial && (
                <blockquote className="mt-4 border-l-4 border-blue-200 pl-4 italic text-gray-600">
                  &ldquo;{c.testimonial}&rdquo;
                </blockquote>
              )}
            </article>
          ))}
          {cases.length === 0 && (
            <p className="text-center py-12 text-gray-400">案例準備中，敬請期待</p>
          )}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600">有興趣了解更多？</p>
          <p className="mt-2 text-blue-600 font-medium">歡迎透過社群媒體聯繫我們</p>
        </div>
      </main>
    </div>
  );
}
