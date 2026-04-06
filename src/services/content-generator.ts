// Spec: specs/market-development-tool/spec.md — US-MD-002
// Task: specs/market-development-tool/tasks.md — Task 6

import Anthropic from "@anthropic-ai/sdk";

interface GenerateContentInput {
  contentType: string;
  targetIndustry: string;
  topic: string;
  tone: string;
}

interface GeneratedContent {
  title: string;
  body: string;
}

interface ContentTemplate {
  contentType: string;
  label: string;
  description: string;
  promptHint: string;
}

export class ContentGeneratorService {
  private client: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async generateContent(input: GenerateContentInput): Promise<GeneratedContent> {
    const { contentType, targetIndustry, topic, tone } = input;

    if (!this.client) {
      return {
        title: `[範本] ${topic}`,
        body: `這是一篇關於「${topic}」的${contentType}範本內容，目標產業：${targetIndustry}。請設定 ANTHROPIC_API_KEY 以啟用 AI 內容產生功能。`,
      };
    }

    const systemPrompt = [
      "你是一位專業的數位行銷內容撰寫專家，專門為傳統產業（製造業、零售業、餐飲業、物流業等）撰寫社群媒體貼文。",
      "請全程使用繁體中文（Traditional Chinese）撰寫。",
      "你的目標是幫助傳統產業了解數位轉型的價值，用淺顯易懂的方式解釋技術概念。",
      "回覆格式請嚴格遵守：第一行為標題（不含任何前綴符號），空一行後為正文內容。",
    ].join("\n");

    const userPrompt = [
      `請撰寫一篇「${contentType}」類型的社群媒體貼文。`,
      `目標產業：${targetIndustry}`,
      `主題：${topic}`,
      `語氣風格：${tone}`,
      "",
      "請提供一個吸引人的標題和完整的貼文內容。",
    ].join("\n");

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const lines = text.trim().split("\n");
    const title = lines[0].replace(/^#+\s*/, "").trim();
    const body = lines
      .slice(1)
      .join("\n")
      .trim();

    return { title, body };
  }

  getContentTemplates(): ContentTemplate[] {
    return [
      {
        contentType: "case_study",
        label: "案例分享",
        description: "分享客戶成功導入數位工具的實際案例",
        promptHint: "請描述客戶的產業背景、面臨的挑戰、採用的解決方案及成效",
      },
      {
        contentType: "industry_insight",
        label: "產業洞察",
        description: "分析傳統產業的數位轉型趨勢與機會",
        promptHint: "請聚焦特定產業的痛點與數位化機會",
      },
      {
        contentType: "tech_guide",
        label: "技術科普",
        description: "以淺顯易懂的方式介紹技術概念",
        promptHint: "請用生活化的比喻來解釋技術概念，避免過多專業術語",
      },
      {
        contentType: "success_story",
        label: "成功故事",
        description: "描述數位轉型帶來的具體成果與改變",
        promptHint: "請強調具體數據與前後對比",
      },
    ];
  }
}

const contentGeneratorService = new ContentGeneratorService();
export default contentGeneratorService;
