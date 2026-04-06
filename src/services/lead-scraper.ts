// Spec: specs/market-development-tool/spec.md — US-MD-001
// Task: specs/market-development-tool/tasks.md — Task 4

export interface LeadData {
  companyName: string;
  industry: string;
  scale: string;
  contactInfo?: Record<string, unknown>;
  source: string;
  sourceUrl?: string;
  digitalMaturity?: string;
}

export interface DataSource {
  fetchLeads(): Promise<LeadData[]>;
}

/**
 * 商工登記資料來源 — fetches leads from government business registration data.
 */
export class GovBusinessDataSource implements DataSource {
  async fetchLeads(): Promise<LeadData[]> {
    // Placeholder: real implementation will call 商工登記 API
    return [
      {
        companyName: "傳統機械股份有限公司",
        industry: "機械製造",
        scale: "中型企業",
        source: "gov_business",
        sourceUrl: "https://findbiz.nat.gov.tw/example/1",
        digitalMaturity: "low",
      },
      {
        companyName: "美味食品有限公司",
        industry: "食品加工",
        scale: "小型企業",
        source: "gov_business",
        sourceUrl: "https://findbiz.nat.gov.tw/example/2",
        digitalMaturity: "low",
      },
    ];
  }
}

/**
 * 政府招標資料來源 — fetches leads from government tender/procurement data.
 */
export class GovTenderDataSource implements DataSource {
  async fetchLeads(): Promise<LeadData[]> {
    // Placeholder: real implementation will call 政府電子採購網 API
    return [
      {
        companyName: "綠能科技股份有限公司",
        industry: "能源科技",
        scale: "大型企業",
        source: "gov_tender",
        sourceUrl: "https://web.pcc.gov.tw/example/1",
        digitalMaturity: "medium",
      },
      {
        companyName: "傳統機械股份有限公司",
        industry: "機械製造",
        scale: "中型企業",
        source: "gov_tender",
        sourceUrl: "https://web.pcc.gov.tw/example/2",
        digitalMaturity: "low",
      },
    ];
  }
}

/**
 * 新聞報導資料來源 — fetches leads from news articles and press releases.
 */
export class NewsDataSource implements DataSource {
  async fetchLeads(): Promise<LeadData[]> {
    // Placeholder: real implementation will scrape/aggregate news sources
    return [
      {
        companyName: "老字號紡織廠股份有限公司",
        industry: "紡織",
        scale: "中型企業",
        source: "news",
        sourceUrl: "https://news.example.com/article/123",
        digitalMaturity: "low",
      },
      {
        companyName: "美味食品有限公司",
        industry: "食品加工",
        scale: "小型企業",
        source: "news",
        sourceUrl: "https://news.example.com/article/456",
        digitalMaturity: "low",
      },
    ];
  }
}

const DIGITAL_MATURITY_ORDER = ["low", "medium", "high"];

export class LeadScraperService {
  private sources: DataSource[];

  constructor(sources: DataSource[]) {
    this.sources = sources;
  }

  /**
   * Scrape all configured data sources, deduplicate by companyName,
   * and return the merged results. When duplicates exist the first
   * occurrence is kept and additional source URLs are discarded
   * (the earliest source wins).
   */
  async scrapeAll(): Promise<LeadData[]> {
    const allResults = await Promise.all(
      this.sources.map((source) => source.fetchLeads()),
    );

    const merged = new Map<string, LeadData>();
    for (const results of allResults) {
      for (const lead of results) {
        if (!merged.has(lead.companyName)) {
          merged.set(lead.companyName, lead);
        }
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Filter leads to only those whose industry is in the provided list.
   */
  filterByIndustry(leads: LeadData[], industries: string[]): LeadData[] {
    return leads.filter((lead) => industries.includes(lead.industry));
  }

  /**
   * Filter leads whose digitalMaturity is at or below the specified maxLevel.
   * Maturity ordering: low < medium < high.
   */
  filterByDigitalMaturity(leads: LeadData[], maxLevel: string): LeadData[] {
    const maxIndex = DIGITAL_MATURITY_ORDER.indexOf(maxLevel);
    if (maxIndex === -1) return leads;

    return leads.filter((lead) => {
      if (!lead.digitalMaturity) return true;
      const idx = DIGITAL_MATURITY_ORDER.indexOf(lead.digitalMaturity);
      return idx === -1 || idx <= maxIndex;
    });
  }
}

// Default singleton instance with all three data sources
const leadScraperService = new LeadScraperService([
  new GovBusinessDataSource(),
  new GovTenderDataSource(),
  new NewsDataSource(),
]);

export default leadScraperService;
