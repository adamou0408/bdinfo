// Spec: specs/market-development-tool/spec.md — US-MD-004
// Task: specs/market-development-tool/tasks.md — Task 12

import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

interface IndustryCount {
  industry: string;
  count: number;
}

interface TrendComparison {
  currentPeriodCount: number;
  previousPeriodCount: number;
  changePercent: number;
  periodDays: number;
}

export class InsightAnalyzerService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      console.warn(
        "InsightAnalyzerService: ANTHROPIC_API_KEY not set. AI summary generation will be skipped.",
      );
    }
  }

  /**
   * Generate a weekly report: query leads created this week,
   * group by industry, calculate trends, and use Claude API for summary.
   * Saves the report to the insights table.
   */
  async generateWeeklyReport(): Promise<void> {
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);

    // Fetch leads created this week
    const leadsThisWeek = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    });

    // Group by industry
    const industryMap = new Map<string, number>();
    for (const lead of leadsThisWeek) {
      const industry = lead.industry ?? "未分類";
      industryMap.set(industry, (industryMap.get(industry) ?? 0) + 1);
    }

    const industriesSorted = Array.from(industryMap.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate trends (this week vs last week)
    const trends = await this.getTrends(7);

    const reportData = {
      totalLeads: leadsThisWeek.length,
      byIndustry: industriesSorted,
      trends: {
        currentWeek: trends.currentPeriodCount,
        previousWeek: trends.previousPeriodCount,
        changePercent: trends.changePercent,
      },
    };

    // Generate AI summary if API key is available
    let summary: string | null = null;
    if (this.anthropic) {
      try {
        const message = await this.anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `你是市場開發工具的分析助手。請根據以下數據生成一份簡潔的週報摘要（使用繁體中文）：

本週新增潛在客戶數：${reportData.totalLeads}
產業分布：${industriesSorted.map((i) => `${i.industry}: ${i.count}筆`).join("、")}
與上週相比變化：${trends.changePercent >= 0 ? "+" : ""}${trends.changePercent.toFixed(1)}%

請提供：
1. 本週重點摘要（2-3句話）
2. 值得關注的趨勢
3. 建議的下一步行動`,
            },
          ],
        });

        const textBlock = message.content.find((block) => block.type === "text");
        if (textBlock && textBlock.type === "text") {
          summary = textBlock.text;
        }
      } catch (err) {
        console.error("InsightAnalyzerService: Failed to generate AI summary:", err);
        summary = `本週新增 ${reportData.totalLeads} 筆潛在客戶。（AI 摘要生成失敗，此為自動摘要）`;
      }
    } else {
      summary = `本週新增 ${reportData.totalLeads} 筆潛在客戶。主要產業：${industriesSorted
        .slice(0, 3)
        .map((i) => i.industry)
        .join("、")}。（AI 摘要未啟用）`;
    }

    // Save to insights table
    await prisma.insight.create({
      data: {
        reportType: "weekly_summary",
        periodStart,
        periodEnd,
        data: reportData as object,
        summary,
      },
    });
  }

  /**
   * Return top industries by lead count.
   */
  async getTopIndustries(limit = 10): Promise<IndustryCount[]> {
    const leads = await prisma.lead.groupBy({
      by: ["industry"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
      where: { industry: { not: null } },
    });

    return leads.map((row: { industry: string | null; _count: { id: number } }) => ({
      industry: row.industry ?? "未分類",
      count: row._count.id,
    }));
  }

  /**
   * Compare current period vs previous period lead counts.
   * Returns the counts and percent change.
   */
  async getTrends(periodDays: number): Promise<TrendComparison> {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - periodDays);

    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);

    const [currentCount, previousCount] = await Promise.all([
      prisma.lead.count({
        where: {
          createdAt: { gte: currentPeriodStart, lt: now },
        },
      }),
      prisma.lead.count({
        where: {
          createdAt: { gte: previousPeriodStart, lt: currentPeriodStart },
        },
      }),
    ]);

    const changePercent =
      previousCount === 0
        ? currentCount > 0
          ? 100
          : 0
        : ((currentCount - previousCount) / previousCount) * 100;

    return {
      currentPeriodCount: currentCount,
      previousPeriodCount: previousCount,
      changePercent,
      periodDays,
    };
  }
}

// Default singleton instance
const insightAnalyzerService = new InsightAnalyzerService();
export default insightAnalyzerService;
