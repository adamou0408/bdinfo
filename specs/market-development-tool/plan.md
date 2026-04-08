# 技術方案：持續開拓市場工具（Market Development Tool）

## 對應規格
- Spec: [spec.md](./spec.md)
- Research: [research.md](./research.md)
- 狀態：`approved`（v1.3）

## 工作量估算
- 總體複雜度：**XL**
- 預估任務數：**14 個任務**
- 預估開發週期：分 4 個階段實施

## 技術選型
| 技術 | 選擇理由 |
|------|----------|
| **Next.js 14 (App Router)** | 全端框架，支援 SSR/SSG 提升 SEO（案例展示頁面需要）、API Routes 內建後端、繁中 i18n 原生支援 |
| **TypeScript** | 型別安全，減少運行時錯誤，提升大型專案可維護性 |
| **PostgreSQL** | 關聯式資料庫，適合 CRM 資料模型（客戶、互動、管道階段間的關聯）；支援 JSON 欄位存放彈性資料 |
| **Prisma ORM** | 型別安全的 ORM，自動產生遷移腳本，支援回滾策略 |
| **NextAuth.js** | 認證方案，支援 RBAC，與 Next.js 深度整合 |
| **Claude API (Anthropic)** | AI 內容產生（社群貼文草擬、市場洞察摘要），無需自建 ML 模型 |
| **Tailwind CSS + shadcn/ui** | 快速建構繁中友善的響應式 UI，元件化設計 |
| **Recharts** | 輕量級圖表庫，用於儀表板數據視覺化 |
| **node-cron** | 排程任務（每日名單更新、每週洞察報告、內容定時發布） |
| **Playwright** | E2E 測試框架，支援多瀏覽器測試 |

## 架構設計

### 元件拆解

```
┌─────────────────────────────────────────────────────────┐
│                    前端（Next.js App Router）              │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  儀表板   │ 客戶名單  │ 內容工作台 │ 市場洞察  │  案例展示     │
│ Dashboard│ Leads    │ Content  │ Insights │  Portfolio   │
│ (US-MD-003)│(US-MD-001)│(US-MD-002)│(US-MD-004)│(US-PC-002) │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────┘
     │          │          │          │            │
┌────┴──────────┴──────────┴──────────┴────────────┴──────┐
│                   API Layer (Next.js API Routes)         │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ /api/    │ /api/    │ /api/    │ /api/    │ /api/        │
│ leads    │ pipeline │ content  │ insights │ portfolio    │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────┘
     │          │          │          │            │
┌────┴──────────┴──────────┴──────────┴────────────┴──────┐
│                    Service Layer                         │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Lead     │ Pipeline │ Content  │ Insight  │ Compliance   │
│ Scraper  │ Tracker  │ Generator│ Analyzer │ Manager      │
│ Service  │ Service  │ Service  │ Service  │ Service      │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────┘
     │          │          │          │            │
┌────┴──────────┴──────────┴──────────┴────────────┴──────┐
│              Data Layer (Prisma + PostgreSQL)             │
├─────────────────────────────────────────────────────────┤
│  leads | interactions | content | insights | audit_logs  │
└─────────────────────────────────────────────────────────┘
     │
┌────┴────────────────────────────────────────────────────┐
│              External Integrations                        │
├──────────┬──────────┬───────────────────────────────────┤
│ 公開資料源 │ Claude   │ Social Media APIs                 │
│ (商工登記  │ API      │ (Facebook/IG Graph API,           │
│  招標公告) │          │  LINE Messaging API)              │
└──────────┴──────────┴───────────────────────────────────┘
```

### 元件互動

1. **Lead Scraper Service** → 定時從公開資料源抓取傳統產業企業資訊 → 存入 `leads` 表
2. **Content Generator Service** → 呼叫 Claude API 產生社群內容草稿 → 存入 `content` 表 → 人工確認後透過 Social Media API 發布
3. **Pipeline Tracker Service** → 管理客戶狀態流轉（發現→接觸→溝通→提案→成交）→ 記錄所有互動至 `interactions` 表
4. **Insight Analyzer Service** → 定時分析 `leads` + `interactions` 數據 → 產生市場洞察報告
5. **Compliance Manager Service** → 橫切所有服務，負責審計日誌、資料過期清理、隱私告知管理

## 與現有系統的整合點
- 此為專案第一個功能，無既有系統整合需求
- 基礎設施使用 `infra/docker/` 容器化部署
- 監控指標輸出至 `infra/monitoring/`

## 風險評估
| 風險 | 可能性 | 影響 | 緩解方案 |
|------|--------|------|----------|
| 公開資料源 API 變動或封鎖 | 中 | 高 | 設計資料源抽象層，支援快速替換；建立多個備用資料源 |
| 社群平台 API 限流或政策變更 | 中 | 中 | 實作重試機制與速率限制；內容先存本地，手動發布作為備案 |
| Claude API 產生不適當內容 | 低 | 高 | 所有 AI 產生內容必須人工確認後才能發布；建立內容審核流程 |
| 個資合規爭議 | 低 | 高 | 僅蒐集公開資訊；建立完整合規框架（告知、刪除、審計）；定期法規檢視 |
| 資料量成長導致效能下降 | 低 | 中 | PostgreSQL 索引優化；分頁查詢；必要時引入快取層 |

## 資料模型變更

### 新增表格

```
leads（潛在客戶）
├── id (UUID, PK)
├── company_name (VARCHAR, NOT NULL)
├── industry (VARCHAR) -- 產業類別
├── scale (VARCHAR) -- 企業規模
├── contact_info (JSONB, ENCRYPTED) -- 聯絡方式（加密存放）
├── source (VARCHAR) -- 資料來源標記
├── source_url (TEXT) -- 資料來源連結
├── digital_maturity (VARCHAR) -- 資訊化程度評估
├── pipeline_stage (ENUM: discovered|contacted|communicating|proposed|closed_won|closed_lost)
├── tags (TEXT[]) -- 標籤
├── privacy_notice_sent (BOOLEAN, DEFAULT false) -- 是否已告知隱私政策
├── data_deletion_requested (BOOLEAN, DEFAULT false)
├── last_interaction_at (TIMESTAMP)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── expires_at (TIMESTAMP) -- 12 個月未互動自動標記過期

interactions（互動紀錄）
├── id (UUID, PK)
├── lead_id (UUID, FK → leads)
├── type (ENUM: note|message|meeting|proposal|call|social_engagement)
├── channel (VARCHAR) -- 互動管道
├── summary (TEXT)
├── result (TEXT)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
└── metadata (JSONB) -- 額外資訊

content（社群內容）
├── id (UUID, PK)
├── title (VARCHAR)
├── body (TEXT) -- 內容本文
├── content_type (ENUM: case_study|industry_insight|tech_guide|success_story)
├── target_industry (VARCHAR)
├── status (ENUM: draft|pending_review|approved|published|archived)
├── scheduled_at (TIMESTAMP) -- 排程發布時間
├── published_at (TIMESTAMP)
├── platform (VARCHAR) -- 發布平台
├── engagement_metrics (JSONB) -- 互動數據
├── ai_generated (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

insights（市場洞察）
├── id (UUID, PK)
├── report_type (ENUM: weekly_summary|trend_analysis|industry_report)
├── period_start (DATE)
├── period_end (DATE)
├── data (JSONB) -- 分析數據
├── summary (TEXT) -- AI 產生的摘要
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

audit_logs（審計日誌）
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── action (VARCHAR) -- 操作類型
├── resource_type (VARCHAR) -- 資源類型
├── resource_id (UUID) -- 資源 ID
├── details (JSONB) -- 操作詳情
├── ip_address (INET)
└── created_at (TIMESTAMP)

users（使用者）
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── name (VARCHAR)
├── role (ENUM: admin|market_developer|viewer)
├── password_hash (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

portfolio_cases（作品集案例）
├── id (UUID, PK)
├── title (VARCHAR)
├── client_industry (VARCHAR)
├── problem_description (TEXT)
├── solution_description (TEXT)
├── results (TEXT) -- 成果數據
├── testimonial (TEXT) -- 客戶證言
├── is_public (BOOLEAN, DEFAULT true)
├── display_order (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

- 遷移策略：全新資料庫，使用 Prisma Migrate 建立，無需向後相容
- 回滾策略：可逆（`prisma migrate reset`），初期無生產資料風險

## 安全性考量
1. **認證**：NextAuth.js 實作 JWT + Session 雙模式認證
2. **授權**：Middleware 層實作 RBAC，所有 API Route 檢查角色權限
3. **加密**：`contact_info` 欄位使用 AES-256 加密後存入 JSONB；全站 TLS
4. **審計**：所有資料存取、匯出、刪除操作寫入 `audit_logs`
5. **合規**：
   - 首次接觸自動附加隱私告知文本
   - `/api/privacy/data-request` 端點供客戶查詢自己的資料
   - `/api/privacy/data-deletion` 端點供客戶請求刪除
   - Cron job 每日檢查並標記超過 12 個月未互動的資料
6. **輸入驗證**：Zod schema 驗證所有 API 輸入
7. **密鑰管理**：所有 API keys 存放環境變數，不進版控

## API 合約
- 此功能涉及 API 變更，詳見 [contracts.md](contracts.md)

## 實作策略

### 階段 1：基礎建設（任務 1-3）
建立專案骨架、資料庫、認證系統。這是所有功能的基礎。

### 階段 2：核心功能（任務 4-8）
平行開發五大核心模組：潛在客戶搜索、內容產生、管道追蹤、市場洞察、案例展示。

### 階段 3：整合與合規（任務 9-11）
串接社群媒體 API、實作合規框架、建立排程系統。

### 階段 4：儀表板與測試（任務 12-14）
整合儀表板、E2E 測試、部署準備。
