# 任務清單：持續開拓市場工具（Market Development Tool）

## 對應規格
- Spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)

## 並行標記說明
- `[P-group-X]`：同一 group 的任務可並行執行
- `[depends: N]`：必須等任務 N 完成後才能開始
- 無標記：按順序依序執行

---

## 階段 1：基礎建設

### 任務 1：專案初始化與開發環境 `[P-group-A]`
- **對應 User Story**：全部（基礎設施）
- **描述**：初始化 Next.js 14 專案（App Router + TypeScript），設定 Tailwind CSS、shadcn/ui、ESLint、Prettier，建立基本目錄結構（`src/app/`、`src/components/`、`src/lib/`、`src/services/`）
- **驗收條件**：
  - [ ] Next.js 14 專案可正常啟動（`npm run dev`）
  - [ ] TypeScript 嚴格模式啟用
  - [ ] Tailwind CSS + shadcn/ui 正常運作
  - [ ] 基本目錄結構建立完成
  - [ ] 繁體中文（zh-TW）設為預設語系
- **測試策略**：
  - Unit：ESLint + TypeScript 編譯通過
  - E2E：首頁可正常載入
- **狀態**：`todo`

### 任務 2：資料庫設計與 Prisma 設定 `[P-group-A]`
- **對應 User Story**：全部（資料層）
- **描述**：設定 PostgreSQL + Prisma ORM，建立完整 schema（leads、interactions、content、insights、audit_logs、users、portfolio_cases），執行初始遷移
- **驗收條件**：
  - [ ] Prisma schema 定義所有 7 張表格
  - [ ] `contact_info` 欄位加密存取邏輯實作
  - [ ] Migration 可正常執行與回滾
  - [ ] Seed 腳本建立測試資料
- **測試策略**：
  - Unit：Schema 驗證、加密/解密邏輯測試
  - Integration：資料庫 CRUD 操作測試
- **狀態**：`todo`

### 任務 3：認證與授權系統 `[depends: 1, 2]`
- **對應 User Story**：全部（安全性需求）
- **描述**：實作 NextAuth.js 認證，建立 RBAC middleware（admin、market_developer、viewer 角色），保護所有 API Route
- **驗收條件**：
  - [ ] 登入/登出功能正常運作
  - [ ] RBAC 中間件正確攔截未授權存取
  - [ ] API Route 皆需認證（portfolio 公開頁面除外）
  - [ ] Session 管理與 JWT token 正常運作
- **測試策略**：
  - Unit：角色權限檢查邏輯
  - Integration：登入流程、API 認證攔截
  - E2E：登入→存取受保護頁面→登出
- **狀態**：`todo`

---

## 階段 2：核心功能

### 任務 4：潛在客戶搜索引擎 `[P-group-B]` `[depends: 3]`
- **對應 User Story**：US-MD-001
- **描述**：建立 Lead Scraper Service，從至少 3 種公開資料源（商工登記公開資料、政府招標公告、新聞/產業報導）抓取傳統產業企業資訊，實作關鍵字篩選與資訊化程度評估邏輯
- **驗收條件**：
  - [ ] 至少整合 3 種公開資料源
  - [ ] 可根據關鍵字與產業條件篩選企業
  - [ ] 抓取結果包含企業名稱、產業、規模、聯絡方式
  - [ ] 資料來源標記正確記錄
  - [ ] 資料源抽象層設計，支援新增/替換資料源
- **測試策略**：
  - Unit：篩選邏輯、資料解析
  - Integration：資料源 API 呼叫與資料寫入
- **狀態**：`todo`

### 任務 5：潛在客戶名單 UI `[P-group-B]` `[depends: 3]`
- **對應 User Story**：US-MD-001
- **描述**：建立客戶名單頁面，含搜尋、篩選、排序功能，顯示企業基本資訊與管道狀態，支援匯出
- **驗收條件**：
  - [ ] 名單頁面顯示所有潛在客戶
  - [ ] 支援依產業、規模、管道階段篩選
  - [ ] 支援關鍵字搜尋
  - [ ] 介面語言為繁體中文
  - [ ] 響應式設計，支援行動裝置
- **測試策略**：
  - Unit：篩選元件邏輯
  - E2E：名單瀏覽、篩選、搜尋操作
- **狀態**：`todo`

### 任務 6：AI 內容產生工作台 `[P-group-B]` `[depends: 3]`
- **對應 User Story**：US-MD-002、US-PC-001
- **描述**：建立 Content Generator Service（串接 Claude API），實作內容工作台 UI（草擬→人工審核→排程→發布流程），支援案例分享、產業洞察、技術科普、成功故事等內容類型
- **驗收條件**：
  - [ ] Claude API 串接正常，可產生傳統產業相關社群內容
  - [ ] 支援 4 種內容類型
  - [ ] 內容模板可自訂
  - [ ] 產生的內容狀態流轉正確（draft→pending_review→approved→published）
  - [ ] 發布前必須經人工確認
  - [ ] 內容排程功能可正常設定定時發布
- **測試策略**：
  - Unit：內容模板邏輯、狀態流轉
  - Integration：Claude API 呼叫與內容儲存
  - E2E：內容產生→審核→排程→模擬發布
- **狀態**：`todo`

### 任務 7：銷售管道追蹤 `[P-group-B]` `[depends: 3]`
- **對應 User Story**：US-MD-003
- **描述**：建立 Pipeline Tracker Service 與管道儀表板 UI，實作客戶狀態流轉（發現→接觸→溝通→提案→成交/失敗）、互動紀錄、自動跟進提醒
- **驗收條件**：
  - [ ] 儀表板以看板或漏斗圖顯示各階段客戶數
  - [ ] 可記錄每次互動（時間、方式、結果）
  - [ ] 超過 N 天未互動自動產生跟進提醒
  - [ ] 客戶狀態可手動拖拽調整
  - [ ] 支援匯出互動報表
- **測試策略**：
  - Unit：狀態流轉邏輯、提醒計算邏輯
  - Integration：互動紀錄 CRUD
  - E2E：客戶狀態變更→互動記錄→提醒觸發
- **狀態**：`todo`

### 任務 8：案例展示頁面（公開） `[P-group-B]` `[depends: 3]`
- **對應 User Story**：US-PC-002
- **描述**：建立公開的線上作品集頁面（不需登入），展示過往案例（問題描述、解決方案、成果數據），支援客戶證言，後台可管理案例內容
- **驗收條件**：
  - [ ] 公開頁面不需登入即可瀏覽
  - [ ] 案例包含問題描述、解決方案、成果數據
  - [ ] 支援客戶證言/推薦信展示
  - [ ] 後台可新增、編輯、排序案例
  - [ ] SEO 友善（SSG/SSR）
- **測試策略**：
  - Unit：案例資料渲染
  - E2E：公開頁面瀏覽、後台案例管理
- **狀態**：`todo`

---

## 階段 3：整合與合規

### 任務 9：社群媒體 API 整合 `[depends: 6]`
- **對應 User Story**：US-MD-002
- **描述**：整合 Facebook/Instagram Graph API 和 LINE Messaging API，實作內容發布功能、互動數據回收（觸及率、按讚、留言、分享、私訊詢問數）
- **驗收條件**：
  - [ ] 可透過 API 發布內容至 Facebook 粉專
  - [ ] 可透過 API 發布內容至 Instagram
  - [ ] 可透過 LINE API 發送內容
  - [ ] 互動數據自動回收並更新 `engagement_metrics`
  - [ ] API 速率限制與重試機制實作
- **測試策略**：
  - Unit：API 呼叫封裝、重試邏輯
  - Integration：Mock API 測試發布與數據回收流程
- **狀態**：`todo`

### 任務 10：合規框架實作 `[depends: 3]`
- **對應 User Story**：US-MD-001、US-MD-003（安全性需求、CONFLICT-002、CONFLICT-003 決議）
- **描述**：建立 Compliance Manager Service，實作完整合規機制：審計日誌自動記錄、隱私告知文本管理、客戶資料查詢/刪除 API、12 個月過期資料自動清理 Cron Job
- **驗收條件**：
  - [ ] 所有資料存取操作自動寫入 `audit_logs`
  - [ ] `/api/privacy/data-request` 可供客戶查詢自己的資料
  - [ ] `/api/privacy/data-deletion` 可供客戶請求刪除
  - [ ] 首次接觸時自動附加隱私告知文本
  - [ ] Cron job 每日檢查並標記 12 個月未互動的過期資料
  - [ ] 資料來源標記完整
- **測試策略**：
  - Unit：過期計算邏輯、隱私告知觸發條件
  - Integration：審計日誌寫入、資料刪除流程
  - E2E：客戶資料查詢→刪除→確認已清除
- **狀態**：`todo`

### 任務 11：排程系統 `[depends: 4, 6]`
- **對應 User Story**：US-MD-001（每日更新）、US-MD-002（內容排程）、US-MD-004（每週洞察）
- **描述**：使用 node-cron 建立統一排程系統：每日潛在客戶名單自動更新、內容定時發布、每週市場洞察報告產生
- **驗收條件**：
  - [ ] 每日自動執行潛在客戶名單更新
  - [ ] 已排程的內容在指定時間自動發布
  - [ ] 每週自動產生市場洞察摘要
  - [ ] 排程執行日誌可查閱
  - [ ] 排程失敗時發送通知
- **測試策略**：
  - Unit：Cron 表達式解析、任務觸發邏輯
  - Integration：模擬時間推進測試排程觸發
- **狀態**：`todo`

---

## 階段 4：儀表板與測試

### 任務 12：市場洞察分析模組 `[depends: 4, 7]`
- **對應 User Story**：US-MD-004
- **描述**：建立 Insight Analyzer Service，分析潛在客戶名單與互動數據，產生市場趨勢分析（使用 Claude API 輔助摘要），建立市場洞察頁面（含 Recharts 圖表）
- **驗收條件**：
  - [ ] 展示 AI/系統開發需求的趨勢變化圖表
  - [ ] 識別並高亮需求成長最快的產業
  - [ ] 每週自動產生市場洞察摘要（Claude API）
  - [ ] 儀表板載入時間 < 3 秒
- **測試策略**：
  - Unit：數據聚合邏輯、趨勢計算
  - Integration：洞察報告產生流程
  - E2E：洞察頁面載入與數據顯示
- **狀態**：`todo`

### 任務 13：總覽儀表板 `[depends: 5, 7, 9, 12]`
- **對應 User Story**：US-MD-003、US-MD-004
- **描述**：建立首頁總覽儀表板，整合：管道漏斗圖（各階段客戶數）、近期互動時間軸、內容互動數據摘要、市場洞察重點、跟進提醒清單
- **驗收條件**：
  - [ ] 儀表板整合所有核心數據
  - [ ] 漏斗圖正確顯示管道各階段數量
  - [ ] 跟進提醒清單正確顯示
  - [ ] 頁面載入時間 < 3 秒
  - [ ] 響應式設計，行動裝置可用
- **測試策略**：
  - Integration：數據聚合正確性
  - E2E：儀表板完整互動測試
- **狀態**：`todo`

### 任務 14：E2E 測試與部署準備 `[depends: 13]`
- **對應 User Story**：全部
- **描述**：使用 Playwright 撰寫完整 E2E 測試套件，覆蓋所有 User Stories 的驗收條件；建立 Dockerfile 與 docker-compose；準備 CI/CD pipeline 設定
- **驗收條件**：
  - [ ] E2E 測試覆蓋所有 6 個 User Stories 的驗收條件
  - [ ] 所有測試通過
  - [ ] Dockerfile 可正常建構與執行
  - [ ] docker-compose 含 app + PostgreSQL + 環境變數範本
  - [ ] CI pipeline 設定檔（GitHub Actions）
  - [ ] README 含本地開發與部署說明
- **測試策略**：
  - E2E：Playwright 全流程測試（登入→名單瀏覽→內容產生→管道追蹤→洞察查看→案例展示）
- **狀態**：`todo`

---

## 進度摘要
- 總任務數：**14**
- 已完成：**0**
- 進行中：**0**
- 需人工介入：**0**
- 可並行的 group 數：**2**（Group A: 任務 1-2、Group B: 任務 4-8）
