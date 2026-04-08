# 衝突編號：CONFLICT-005

## 狀態：`detected`

## 衝突描述
- **市場開發者（既有 MDT 使用者）** 需要：依 research 決策 #4「深度共用」,直接重用 market-development-tool v2.1 的內建 CRM、Prisma models（`Lead`、`OutreachLog`、`ContentDraft`)、lead-scraper 與 content-generator,僅以「開發者頻道適配層」的形式擴充,不得重造輪子（req-promotion-strategy 需求摘要、依賴關係、NFR「可維護性」)
- **市場開發者（req 推廣執行者）** 需要：US-MD-012 明確要求開發者漏斗與意見領袖關係視圖必須與既有「傳統產業客戶」資料**完全隔離,不得混淆誤用**;審計流程（NFR 安全性）也要求與傳統產業客戶的審計流隔離
- **為什麼衝突**：「深度共用」與「完全隔離」在同一組基礎設施（同一個 Prisma schema、同一個 CRM 應用、同一個 content-generator pipeline、同一個審計表)上同時被要求。技術上，加一個 `persona_type` / `channel` 欄位即可在邏輯層分流,但這只是「軟隔離」(同一張表、同一個 DB connection、同一個 RBAC 角色)。spec 文字使用的是「**完全**隔離」「不得混淆誤用」「審計流隔離」這類強語意,正常解讀偏向「硬隔離」(獨立 schema / 獨立資料表 / 獨立匯出管道 / 獨立稽核日誌)。硬隔離與「深度共用、不重造輪子」直接抵觸:任何硬隔離都會在資料層、權限層、儀表板層各自製造一份新元件,違反「僅新增適配層」的範疇邊界。

## 衝突類型
**權限／隔離衝突**（共用 vs 隔離）+ **架構範疇衝突**（深度共用的承諾 vs 強隔離的要求）

## 相關 User Stories / NFR
- US-MD-012（req-promotion-strategy）：開發者漏斗與意見領袖視圖,必須與既有傳統產業客戶資料**完全隔離**
- req-promotion-strategy 依賴關係：共享 Prisma models（預期新增 `channel`、`locale` 欄位)
- req-promotion-strategy NFR「可維護性」：以模組化方式掛載到既有 pipeline,不得直接修改 MDT 核心 scraper/generator 邏輯
- req-promotion-strategy 安全性需求：審計日誌與傳統產業客戶的審計流隔離
- market-development-tool v2.1 安全性需求:RBAC、靜態加密、審計日誌（單一審計流)
- research 決策 #4：深度共用 — 緊密重用既有 content-generator / lead-scraper / prisma models / CRM

## AI 分析
這是「深度共用 + 完全隔離」這對承諾的核心結構性張力,也是 spec 自身內部最尖銳的矛盾之一:

1. **「完全隔離」的語意層級不明**:US-MD-012 沒有指定隔離是發生在 (a) UI 視圖層 (b) 應用查詢層 (c) DB schema 層 (d) DB instance 層,還是 (e) 整套服務 / 容器層。每往下一層,違反「深度共用」的程度就越高;每往上一層,意外洩漏的風險就越高。
2. **共用 Prisma model 的副作用**:在同一張 `Lead` 表中存放兩種 persona 並用 `persona_type` 篩選,任何寫錯 WHERE 條件的查詢、匯出、報表、外展腳本、自動跟進排程,都會「混淆誤用」。MDT v2.1 已 done 的程式碼並未為新增的 persona_type 欄位做防呆;新加的開發者漏斗程式碼若繞過某個過濾器,就可能對傳統產業客戶送出開發者敘事的外展訊息(這正是 spec 明令禁止的場景)。
3. **審計流隔離與單一審計表的不相容**:既有 MDT 的審計日誌是單一表（NFR 寫的是「記錄所有外展活動」),若 req 推廣需求要求審計流隔離,就需要至少新增獨立的審計表 / 獨立的 retention policy / 獨立的存取角色。這已經超出「適配層」的範疇,屬於修改 MDT 核心。
4. **權限設計的灰區**:NFR 寫「僅市場開發者角色可存取 CRM 儀表板的開發者漏斗視圖」,但市場開發者**也是**傳統產業客戶視圖的存取者。同一個自然人帳號可看到兩邊資料,「完全隔離」就只能靠 UI 切換 + 自律,而非權限強制。
5. **與 CONFLICT-004 的耦合**:若 CONFLICT-004 走向「方案 1：硬隔離 — 新建獨立 dev-content-generator」,本衝突也會自然滑向硬隔離方向,使「深度共用」的承諾整體失效;若 CONFLICT-004 走向方案 3 折衷,本衝突也需要對應的折衷層級。兩者的決議方向應一致,否則會出現架構錯位。

## 解決方案
- [ ] 方案 1:**硬隔離 — 為開發者漏斗建立獨立的 Prisma schema / 資料庫實例 / 審計表**（優先滿足 US-MD-012 的「完全隔離」)。在同一個應用內以兩組獨立的 Prisma client 存取兩個 schema,儀表板透過 feature flag 切換。代價:嚴重違反 research 決策 #4「深度共用」的承諾,程式碼重複度大幅上升,且需要修改 MDT 核心(新增第二份 schema 註冊)。
- [ ] 方案 2:**軟隔離 + 強防呆**（優先滿足深度共用 + 範疇邊界)。維持單一 Prisma schema,新增 `channel`、`persona_type`、`locale` 欄位,但在資料層強制 row-level security / Prisma middleware 攔截所有未指定 persona_type 的查詢,並在儀表板層用獨立路由前綴 + 額外的 RBAC sub-role 防止跨界。「完全隔離」改解讀為「邏輯上不可在同一視圖混合呈現,且任何跨界操作必須留下警示審計」。代價:US-MD-012 的「完全隔離」字面語意被重新解讀,需要 spec 擁有者書面確認;且軟隔離本質上仍存在誤用風險。
- [ ] 方案 3:**雙層架構 — 共用儲存層,分離應用層**（折衷方案)。Prisma models 共用(新增欄位),但 CRM 應用拆成兩個獨立的 Next.js route group(`/crm/enterprise/*` 與 `/crm/dev/*`),各自有獨立的 controller、service、權限中介層、審計表寫入器,只共用最底層的 ORM 與基礎設施。市場開發者透過不同 URL 進入不同視圖,系統永不在同一頁面或同一查詢中混合兩種 persona。代價:應用層程式碼重複度中等,需新增第二套審計表,但仍能宣稱「資料層深度共用」。

## 決策紀錄
- **決策者**:（待定)
- **決策日期**:（待定)
- **選擇方案**:（待定)
- **理由**:（待定)
