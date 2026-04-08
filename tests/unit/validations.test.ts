// Spec: specs/market-development-tool/contracts.md
// Task: specs/market-development-tool/tasks.md — Task 2

import {
  leadQuerySchema,
  leadUpdateSchema,
  interactionCreateSchema,
  contentGenerateSchema,
  portfolioCaseSchema,
  dataDeletionSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("leadQuerySchema", () => {
    it("should accept valid query params", () => {
      const result = leadQuerySchema.parse({ page: "1", limit: "20" });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should use defaults for missing params", () => {
      const result = leadQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sort_by).toBe("created_at");
    });
  });

  describe("leadUpdateSchema", () => {
    it("should accept valid pipeline stage", () => {
      const result = leadUpdateSchema.parse({ pipeline_stage: "contacted" });
      expect(result.pipeline_stage).toBe("contacted");
    });

    it("should reject invalid pipeline stage", () => {
      expect(() => leadUpdateSchema.parse({ pipeline_stage: "invalid" })).toThrow();
    });
  });

  describe("interactionCreateSchema", () => {
    it("should accept valid interaction", () => {
      const result = interactionCreateSchema.parse({
        type: "meeting",
        channel: "LINE",
        summary: "初次會議",
      });
      expect(result.type).toBe("meeting");
    });

    it("should reject invalid type", () => {
      expect(() => interactionCreateSchema.parse({ type: "invalid" })).toThrow();
    });
  });

  describe("contentGenerateSchema", () => {
    it("should accept valid content request", () => {
      const result = contentGenerateSchema.parse({
        content_type: "industry_insight",
        topic: "AI in manufacturing",
      });
      expect(result.target_industry).toBe("傳統產業");
      expect(result.tone).toBe("專業但易懂");
    });
  });

  describe("portfolioCaseSchema", () => {
    it("should accept valid case", () => {
      const result = portfolioCaseSchema.parse({
        title: "AI 品檢系統",
        clientIndustry: "製造業",
      });
      expect(result.isPublic).toBe(true);
    });

    it("should require title", () => {
      expect(() => portfolioCaseSchema.parse({})).toThrow();
    });
  });

  describe("dataDeletionSchema", () => {
    it("should accept valid deletion request", () => {
      const result = dataDeletionSchema.parse({
        email: "test@example.com",
        verification_code: "123456",
      });
      expect(result.email).toBe("test@example.com");
    });

    it("should reject invalid email", () => {
      expect(() =>
        dataDeletionSchema.parse({ email: "not-email", verification_code: "123456" })
      ).toThrow();
    });
  });
});
