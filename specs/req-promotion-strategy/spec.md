# req 框架推廣策略（req Promotion Strategy）

## 狀態：`draft`

## 版本歷史

| 版本 | 日期 | 變更摘要 | 觸發者 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本（已整合 research.md 的四項歧義澄清決策） | /translate |

## 來源追溯

- 原始需求：[intake/raw/2026-04-08-req-promotion-strategy.md](../../intake/raw/2026-04-08-req-promotion-strategy.md)
- 調研報告：[research.md](./research.md)
- 提出者：市場開發者（同時為 `adamou0408/req` 專案維護者）
- 提出日期：2026-04-08

## 負責人

- Spec 擁有者：市場開發者
- 技術負責人：待指派
- 審核者：市場開發者
- 審核期限：待排定

## 依賴關係

- 前置需求：[market-development-tool](../market-development-tool/spec.md) v2.1 `done` — 本 spec 採用「深度共用」策略,重用其 content-generator、lead-scraper、prisma models 與內建 CRM,僅新增「開發者頻道適配層」
- 後續需求：無
- 共享資源：
  - `content-generator`(新增 locale 參數與「開發者敘事」內容風格變體)
  - `lead-scraper`(新增開發者社群資料源適配器:GitHub、Dev.to、HackerNews、Reddit)
  - Prisma models(`Lead`、`OutreachLog`、`ContentDraft` — 預期新增 `channel` 與 `locale` 欄位)
  - 內建 CRM 儀表板(新增「開發者漏斗」與「意見領袖關係」視圖)

## 需求摘要

市場開發者希望為 `adamou0408/req`(需求驅動開發框架)建立一套純品牌定位/推廣打法(非變現導向),對標 `TraderAlice/OpenAlice` 的社群經營實況,將 req 框架推向「開源框架採用者」與「社群意見領袖」兩類目標群體,並同步覆蓋中文圈與英文國際社群。本推廣工作必須深度共用既有的 [market-development-tool](../market-development-tool/spec.md) 基礎設施(內容產製器、潛在對象名單、CRM 儀表板),僅以「開發者頻道適配層」的形式擴充,不得重造輪子,也不引入付費機制或 SaaS 設計。

## 使用者故事

### 角色 A:市場開發者(Market Developer) — 推廣執行者

**US-MD-010**
- **作為**市場開發者,**我想要**系統能從開發者社群資料源(GitHub trending、Dev.to、HackerNews、Reddit r/programming、Twitter/X 技術標籤)自動識別可能對 req 框架感興趣的開源採用者與意見領袖,**以便**我不用手動爬梳論壇也能獲得精準的開發者受眾名單。
- **驗收條件**:
  - [ ] `lead-scraper` 擴充至少 4 種開發者資料源(GitHub、Dev.to、HackerNews、Reddit)
  - [ ] 採用者與意見領袖以 `persona_type` 欄位區分儲存
  - [ ] 可依篩選條件(star 數、follower 數、最近活躍度、話題標籤)過濾候選名單
  - [ ] 每日自動更新,延遲不超過 24 小時
  - [ ] 資料源不得以會損害專案聲譽的方式抓取(遵守各站 ToS 與 rate limit)

**US-MD-011**
- **作為**市場開發者,**我想要**系統能產生「開發者敘事風格」的雙語內容(英文優先 + 繁體中文對照),包含 README 改寫、landing page 文案、技術部落格草稿、Show HN 貼文、Twitter/X thread、對比文章,**以便**我能快速產出符合各開發者平台調性的推廣素材。
- **驗收條件**:
  - [ ] `content-generator` 新增 `locale` 參數,支援 `en` 與 `zh-TW` 雙軸同步產出
  - [ ] 支援至少 6 種開發者內容類型:README、landing page、blog post、Show HN、Twitter thread、對比分析
  - [ ] 內容明確點出 req 的 USP(需求驅動、從 intake 到 implement 的完整鏈路、AGENTS.md 規範治理)
  - [ ] 每份草稿產生時同步輸出英文版與中文版,並在 metadata 中標記 `locale`
  - [ ] 產出的內容在發布前需要人工確認與微調
  - [ ] 禁止產出過度行銷或誇大語氣(以免損及對意見領袖的公信力)

**US-MD-012**
- **作為**市場開發者,**我想要**在既有 CRM 儀表板新增「開發者漏斗」與「意見領袖關係」兩個視圖,**以便**我能用同一套工具追蹤傳統產業客戶與 req 框架推廣這兩條獨立的漏斗。
- **驗收條件**:
  - [ ] 儀表板可依 `persona_type` 切換顯示(傳統產業客戶 / 開源採用者 / 意見領袖)
  - [ ] 開發者漏斗階段:發現→試用→採用→回訪
  - [ ] 意見領袖關係視圖顯示:聯繫狀態、最近一次互動、是否已產出內容、內容 URL
  - [ ] 支援記錄每次互動的管道(email、GitHub issue、Twitter DM、Discord、blog comment)
  - [ ] 必須與既有「傳統產業客戶」資料完全隔離,不得混淆誤用

**US-MD-013**
- **作為**市場開發者,**我想要**一份 req 專案的品牌定位文件(含 USP、目標受眾、敘事主軸、與 OpenAlice 類專案的差異化陳述),**以便**我在產生任何推廣內容前都有一致的敘事基準,避免訊息分裂。
- **驗收條件**:
  - [ ] 品牌定位文件以 markdown 儲存於 repo(建議路徑 `docs/branding/positioning.md`)
  - [ ] 文件內容包含:一句話定位、三個 USP、目標 persona 對應敘事、禁用詞與標語清單
  - [ ] `content-generator` 在產生內容時必須引用此文件作為 prompt 的 context
  - [ ] 文件版本受 git 追蹤,變更需由 Spec 擁有者審核

### 角色 B:開源框架採用者(Open-Source Framework Adopter) — 目標受眾 A

**US-OSA-001**
- **作為**開源框架採用者,**我想要**在任何管道(GitHub README、landing page、部落格文章、Show HN 貼文)**30 秒內**理解「req 解決我什麼問題」以及「它跟既有工具(Cursor、Copilot、Aider、Cline 等)的差別」,**以便**我能快速決定是否值得深入試用。
- **驗收條件**:
  - [ ] README 首屏(above the fold)呈現:一句話價值主張、一張架構/流程圖、一段 quickstart 指令
  - [ ] README 含「Why req?」區段,明確對比至少 2 個同類工具
  - [ ] 英文 README 為 primary,繁體中文 README 為對照版本,兩份同時更新
  - [ ] landing page 首屏閱讀時間 < 30 秒即可理解核心價值
  - [ ] 明確標註授權條款(可商用與否)

**US-OSA-002**
- **作為**開源框架採用者,**我想要**一個可以在 **15 分鐘內**跑完的 quickstart(含 demo 倉庫或一鍵 docker compose),**以便**我能親眼看到 req 在真實專案中的運作,而不是只讀抽象描述。
- **驗收條件**:
  - [ ] quickstart 步驟總數 ≤ 5 步
  - [ ] 提供 demo repository 或 `docker-compose up` 的一鍵啟動方式
  - [ ] quickstart 從 `/req-intake` 跑到 `/req-implement` 完整走完一次 mini 範例
  - [ ] quickstart 文件英中雙語

**US-OSA-003**
- **作為**開源框架採用者,**我想要**看到 req 專案本身是活躍的(最近 commit、release、issue 回應速度、社群互動),**以便**我能建立「這專案不會半死不活」的信心。
- **驗收條件**:
  - [ ] README 動態顯示 badge:最近 commit、最新 release、open issues、contributors 數
  - [ ] 推廣內容中引用真實使用者的 star / fork / 社群貼文(社會證明)
  - [ ] 專案 issue 與 discussion 維持公開回應(目標 SLA:48 小時內首次回應 — 以人工執行,不由本 spec 的工具代為回應)

### 角色 C:社群意見領袖(Community Champion) — 目標受眾 B

**US-CC-001**
- **作為**社群意見領袖,**我想要**收到專案維護者的個人化聯繫(而非罐頭信),內容明確說明為什麼我的觀眾可能對 req 感興趣、提供 exclusive 的技術細節或 early access,**以便**我能快速評估是否值得產出內容介紹這個工具。
- **驗收條件**:
  - [ ] `content-generator` 能依意見領袖的過往內容主題產生客製化 outreach 草稿(須人工確認後才發送)
  - [ ] 外展訊息明確提到該意見領袖的具體作品或觀點(反罐頭化)
  - [ ] 提供 exclusive 資訊:技術 deep dive 文件、roadmap、或維護者訪談機會
  - [ ] 首次接觸時透明告知資料使用方式(沿用既有 market-development-tool 的合規框架)
  - [ ] 提供簡單的拒絕/退訂管道,拒絕後系統自動標記且 12 個月內不再接觸

**US-CC-002**
- **作為**社群意見領袖,**我想要**輕易取得 req 專案的「話題性素材包」(media kit:logo、標準化對比圖表、可嵌入的 demo 片段、可引用的品牌描述),**以便**我能直接使用於我的文章、影片或 talk,而不用自己重做素材。
- **驗收條件**:
  - [ ] repo 提供公開的 media kit 資料夾(例如 `docs/media-kit/`)
  - [ ] 包含:SVG/PNG logo、品牌色、一句話描述(英中雙語)、可引用的功能對比表、demo GIF 或影片連結
  - [ ] 授權條款明確標註「allowed for editorial use」
  - [ ] 在 landing page 與 README 中提供明顯的 media kit 連結

**US-CC-003**
- **作為**社群意見領袖,**我不想要**被專案方要求寫軟文或干涉我的評論獨立性,**以便**我能保護自己對訂閱者的公信力。
- **驗收條件**:
  - [ ] 所有外展訊息模板禁止包含「請正面評價」「請幫推」「交換 X 換 Y」等字樣
  - [ ] `content-generator` 的意見領袖外展模板需在 prompt 中明確加入「不要求回報、不干涉評論方向」的約束
  - [ ] 品牌定位文件列出禁用詞清單,由 Spec 擁有者維護

## 衝突標記

- ⚠️ **CONFLICT-004**(`detected`):US-MD-011 + NFR「i18n 雙軸」要求 content-generator 雙語(en + zh-TW)輸出,與既有 market-development-tool v2.1 NFR「語言:繁體中文(zh-TW)」的單一語言鎖定衝突 — 跨 spec 功能/NFR 衝突 → 見 [conflicts/CONFLICT-004.md](../../conflicts/CONFLICT-004.md)
- ⚠️ **CONFLICT-005**(`detected`):US-MD-012 要求開發者漏斗與意見領袖視圖與既有傳統產業客戶資料「完全隔離」、審計流隔離,但 research 決策 #4 採「深度共用」策略且 NFR「可維護性」不得修改 MDT 核心邏輯 — 權限/隔離衝突 + 架構範疇衝突 → 見 [conflicts/CONFLICT-005.md](../../conflicts/CONFLICT-005.md)
- ⚠️ **CONFLICT-006**(`detected`):US-CC-001 要求個人化外展 + exclusive 資訊以促成意見領袖內容產出,US-CC-003 禁止任何要求回報或干涉評論獨立性的語言;兩者在「外展訊息真實意圖」上產生功能/倫理衝突 → 見 [conflicts/CONFLICT-006.md](../../conflicts/CONFLICT-006.md)
- ⚠️ **CONFLICT-007**(`detected`):req-promotion-strategy 的所有 US-MD 與 US-CC 工作流與既有 MDT v2.1 的持續性營運指標由同一位市場開發者執行,人力時間有限 — 跨 spec 優先級/資源衝突 → 見 [conflicts/CONFLICT-007.md](../../conflicts/CONFLICT-007.md)
- ⚠️ **CONFLICT-008**(`detected`):US-OSA-001/002 要求 README 首屏 30 秒理解 + 15 分鐘 quickstart 的極簡化,US-CC-002 + US-CC-001 要求豐富的 media kit / 對比表 / 技術 deep dive 在顯眼位置 — 同一塊認知版面的 UX 衝突 → 見 [conflicts/CONFLICT-008.md](../../conflicts/CONFLICT-008.md)

## 非功能需求

- **i18n 雙軸**:所有對外素材(README、landing page、內容草稿、media kit 描述)必須同時具備英文與繁體中文版本,英文為 primary。既有 market-development-tool 的 CRM 管理介面維持繁中即可,不強制翻譯。
- **效能**:lead-scraper 新增資料源後不得使整體爬取週期超過 6 小時;content-generator 單次產出(英中雙版本)應在 60 秒內完成
- **相容性**:品牌素材需在 GitHub、Dev.to、HackerNews、Reddit、Twitter/X 的排版限制下正確顯示
- **可維護性**:新增的「開發者頻道適配層」必須以模組化方式掛載到既有 pipeline,不得直接修改 market-development-tool 的核心 scraper/generator 邏輯
- **非變現**:本 spec 明確排除付費機制、SaaS 設計、付費牆、訂閱模組 — 純品牌定位打法

## 安全性需求

- **資料分類**:公開(品牌素材、README、landing page) / 內部(意見領袖聯繫名單、互動紀錄)
- **認證需求**:繼承 market-development-tool — 僅市場開發者角色可存取 CRM 儀表板的開發者漏斗視圖
- **授權需求**:沿用 RBAC;意見領袖聯繫紀錄為敏感資料,只有 Spec 擁有者可匯出
- **加密需求**:傳輸中加密(TLS);靜態加密(意見領袖聯繫資訊)
- **審計日誌**:記錄所有對意見領袖的外展動作、個人化訊息草稿的產生與發送,並與傳統產業客戶的審計流隔離
- **個資處理**:
  - 意見領袖皆為「公眾活躍的開發者」,其公開 profile 資訊(GitHub username、blog URL、Twitter handle)可蒐集
  - 個人 email 與 DM 內容須遵守既有合規框架(透明告知、提供刪除管道、12 個月未互動後自動清除)
  - 拒絕接觸後立即標記,12 個月內不再聯繫
- **品牌安全**:禁止產出過度行銷、誇大成效、攻擊競品、或要求回報的內容 — 透過 prompt 層面與人工審核雙重把關

## 成功指標

- **目標 1(可見度)**:上線後 90 天內,`adamou0408/req` 的 GitHub star 數成長達到基準的 3 倍以上;English README 的 unique visitor 週增 20% 以上
- **目標 2(採用)**:上線後 90 天內,累計至少 10 個外部 repository 在 README/docs/issues 中引用或 fork req 框架
- **目標 3(意見領袖覆蓋)**:上線後 90 天內,至少 5 位社群意見領袖在其內容(部落格/影片/貼文/talk)中主動提及 req 框架,且其中至少 2 位覆蓋英文國際社群
- **目標 4(雙軸平衡)**:英文與繁中內容產出數量比應維持在 ≥ 1:1(確保英文不被忽略)
- **量測方式**:
  - GitHub API(star、fork、traffic insights)
  - CRM 儀表板的意見領袖關係視圖(追蹤每位意見領袖的內容產出狀態)
  - content-generator 的產出統計(按 locale 分類)
  - 人工蒐集提及 req 框架的外部文章/影片連結

## 開放問題

- [ ] 品牌定位文件(US-MD-013)的三個 USP 具體為何?需要在 `/req-plan` 階段之前由 Spec 擁有者拍板,否則 `content-generator` 的所有輸出會失去基準
- [ ] 英文 README 由誰執筆或審校?(AI 草稿 vs 人工母語者潤飾)— 影響非功能需求中「英文為 primary」的可執行性
- [ ] demo repository(US-OSA-002)使用真實案例還是製作 toy example?— 影響 quickstart 的可信度與維護成本
- [ ] 是否需要申請 HackerNews Show HN、Product Hunt、Dev.to 首頁等一次性推廣活動的時間窗?(不列入本 spec 但需在推廣執行計畫中排程)
- [ ] Discord / Slack 社群是否要自建?本 spec 預設「不自建社群」以降低維運負擔,改為在既有社群(如 HackerNews、Reddit、Dev.to)互動 — 待確認
