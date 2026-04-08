# 調研報告：req 專案推廣策略（req-promotion-strategy）

## 來源
- 原始需求：[intake/raw/2026-04-08-req-promotion-strategy.md](../../intake/raw/2026-04-08-req-promotion-strategy.md)
- 推廣主體：[`adamou0408/req`](https://github.com/adamou0408/req)
- 商業策略參考：[`TraderAlice/OpenAlice`](https://github.com/TraderAlice/OpenAlice)
- 調研日期：2026-04-08
- 調研負責：`/req-research`（子代理程式 + WebFetch）

## 去重檢查

### 相似需求掃描結果
| 現有 Spec | 相似度 | 重疊部分 | 建議 |
|-----------|--------|----------|------|
| [market-development-tool](../market-development-tool/spec.md) | 30–40% | 基礎設施共用：內容自動草擬（US-MD-002）、互動數據追蹤（US-MD-003）、市場洞察分析（US-MD-004）皆可重用；**但目標受眾與敘事完全不同** | 獨立 spec，明確宣告依賴關係並重用既有 code |

### 結論
- [ ] 無重複，可繼續進入 `/translate`
- [x] **部分重疊**，建議建立獨立 spec 並宣告與 `market-development-tool` 的共用資源依賴
- [ ] 完全重複，建議透過 `/iterate` 更新現有 spec

**理由**：既有 `market-development-tool` 聚焦於「市場開發者 → 傳統產業 B2B 客戶」（企業痛點導向、社群媒體為主、繁中內容）。本次需求聚焦於「req 框架 → 開源開發者社群 B2D 受眾」（開發者生產力導向、GitHub/Dev.to/HN/Twitter 為主、國際化多語內容）。兩者基礎設施可共用，敘事與受眾差異巨大，不宜合併。

## 可行性評估

**整體等級：🟡 Yellow** — 技術風險可控,但策略定位與商業化範疇需人類在 `/translate` 階段明確釐清。

### 技術風險
| 風險項目 | 風險等級 | 說明 |
|----------|----------|------|
| 跨專案品牌敘事衝突 | 中 | 既有 MDT spec 的傳統產業 B2B 敘事與 req 專案的開發者 B2D 敘事需嚴格分離,避免混淆讀者與違反雙方內容排程 |
| 開發者社群平台整合 | 中 | GitHub Discussions API、Dev.to API、HackerNews 抓取、Twitter/X API 各有不同的認證方式與速率限制,未在既有 MDT 範圍內 |
| 授權與商業化定位 | 中 | 使用者指定參考 OpenAlice 商業策略,但 OpenAlice 實際採 AGPL-3.0 純開源且 README 無明確變現,需釐清「商業策略」指的是**變現模式**還是**推廣定位**(見下方「建議方向」) |
| 國際化(i18n)內容產製 | 低-中 | req 現況僅繁中;若要觸及西方開發者社群,需同步產出英文內容(README、docs、社群貼文) |

### 是否涉及以下高風險領域？
- [ ] 資料庫 schema 變更（可能僅需微調既有 Content/Interaction/Insight 模型,加上 dev-channel 欄位）
- [x] 新的外部依賴或第三方整合（GitHub API、Dev.to API、HackerNews、Twitter/X API）
- [x] 安全敏感操作（OAuth token、API keys、貢獻者資料涉及 PII）
- [ ] 效能敏感操作
- [ ] 基礎設施變更（預期可重用既有服務容器）

## 相關現有資源

### 相關 Specs
- [specs/market-development-tool/spec.md](../market-development-tool/spec.md) — 狀態 `done`,已完整實作 14 個任務,提供可重用的內容產製、互動追蹤與洞察儀表板基礎設施

### 相關程式碼（由子代理程式掃描確認）
- `src/services/content-generator.ts` — 基於 Anthropic SDK 的社群內容自動草擬引擎,可重用為 req 推廣內容的產生器
- `src/services/lead-scraper.ts` — 資料源發現模式,可改寫為「開發者社群潛在採用者發現」(例如:關注 spec-kit / Claude Code / Cursor Rules 的開發者)
- `prisma/schema.prisma` — `Content`, `Interaction`, `Insight` 模型已齊備,僅需新增 dev-channel 欄位(如 `channel: 'github' | 'devto' | 'hn' | 'twitter'`)
- `src/lib/auth.ts`, `src/lib/encryption.ts` — 既有隱私合規框架,可套用於貢獻者/採用者資料保護

### 相關基礎設施
- `docker-compose.yml`、`Dockerfile` — 既有部署鏈路,預期僅需新增環境變數(GitHub Token、Dev.to API Key 等)
- `.github/workflows/` — 既有 CI/CD,可直接支援本次新增檔案

### 相關角色
| Persona | 現況 | 可否重用 |
|---------|------|----------|
| [market-developer](../../personas/market-developer.md) | 已存在 | 部分重用(客戶獲取心態可轉移,但 B2B vs B2D 差異大) |
| [prospective-client](../../personas/prospective-client.md) | 已存在 | **不可重用**(企業買家 ≠ 開源採用者) |
| **open-source framework adopter**(開源框架採用者) | **(新)** | 需在 /translate 階段建立 |
| **framework contributor**(框架貢獻者) | **(新)** | 需在 /translate 階段建立 |
| **community champion**(社群意見領袖) | **(新)** | 需在 /translate 階段建立(影響力用戶,如部落客、HN/Twitter 思想領袖) |

## 未解決的相關衝突
- 無(`conflicts/` 目錄中僅有 market-development-tool 已解決的三項)

## 競品/參考對標速覽

### 🎯 推廣主體:[adamou0408/req](https://github.com/adamou0408/req)
- **定位**:需求驅動 AI 開發框架 — 「You don't need to know any tech, just say what you want」
- **現況指標**:0 stars / 0 forks / 單一貢獻者 / 53 commits / v2.0.0 (Apr 2026)
- **文件語言**:**繁體中文 only** — 對西方開發者社群為重大阻礙
- **視覺資產**:無 logo、無截圖、無 demo GIF、僅有 Mermaid 流程圖
- **缺漏元件**:roadmap、社群頻道(Discord/Slack)、贊助資訊、貢獻指南、stars badge、案例研究、推薦語、授權條款不明
- **推廣優勢**:強烈的「解放非技術人員」敘事、12 slash commands + 2 subagents 結構化工作流、Init/Submodule 雙安裝模式
- **關鍵缺口**:零社會證明、無國際化、無品牌識別、極早期(無社群)

### 🎯 參考對標:[TraderAlice/OpenAlice](https://github.com/TraderAlice/OpenAlice)
- **定位**:AI 加密/證券交易代理引擎 — 「Your one-person Wall Street」
- **現況指標**:⭐ **3.4k stars / 481 forks / 500 commits**、活躍開發中
- **授權**:**AGPL-3.0**(強 copyleft)
- **明確變現機制**:**無** — README 未列出付費版、SaaS、企業版或任何商業服務
- **品牌網站**:openalice.ai(品牌域名獨立)、DeepWiki 整合 badge
- **核心 USP**:file-driven (Markdown/JSON/JSONL)、git-like trading workflow、multi-provider AI、Unified Trading Account 抽象、zero-database 設計
- **敘事策略**:「民主化機構級交易基礎設施」— 將研究、量化、風控、執行整合到單人工作站
- **路線圖方向**:純技術(v1 穩定、broker 支援、snapshot);**沒有成長/商業策略章節**

### ⚠️ 關鍵觀察:OpenAlice 的「商業策略」實際為「純開源 + 強定位」
使用者要求「參考 OpenAlice 的**商業策略**」,但實際上 OpenAlice **沒有任何明確變現機制**,其成功(3.4k ⭐)來自於:
1. **一句話強定位**:「Your one-person Wall Street」直擊痛點
2. **清晰的技術 USP**:file-driven + git-like + zero-DB 三個記憶點
3. **獨立品牌網域**:openalice.ai
4. **copyleft 授權建立信任**:AGPL 代表「核心永遠自由」
5. **技術導向敘事**:完全不強調商業化,反而建立社群信任

**這代表**:req 專案若要參考 OpenAlice,**核心借鑒應為「品牌定位 + 社群信任建立」,而非「付費模式設計」**。需要在 `/translate` 階段向使用者確認其「商業策略」的真實語意。

## 建議方向

### 需在 `/translate` 階段優先釐清的歧義
1. **「商業策略」的真實語意**(最重要): (A) 品牌定位與推廣打法(如 OpenAlice 實況) / (B) 實際付費變現模式(如 open-core、SaaS、諮詢服務) / (C) 兩者都要
2. **推廣範疇的三個層次**: (A) 採用者(adopter)獲取 / (B) 貢獻者(contributor)招募 / (C) 社群意見領袖(champion)建立關係 — 建議先做 A,逐步展開 B 與 C
3. **目標市場地理範圍**: 中文圈優先 vs 英文國際社群 vs 雙軌並行(影響 i18n 投資)
4. **與既有 `market-development-tool` 的資源配置**: 共用 content-generator/CRM/analytics,但分離品牌敘事與發佈管道

### 初步策略建議(供 /translate 參考)
1. **對標 OpenAlice 做 req 的「第一眼定位」**:
   - 設計一句話 USP(例:「The Git for AI-driven specs」或「讓 AI 從需求到部署一氣呵成」)
   - 建立品牌網域與 logo(填補現有視覺資產缺口)
   - 增加英文 README、快速上手 demo GIF
2. **選擇明確授權條款**並公告(現階段 req repo 授權不明,為推廣重大阻礙)
3. **建立基礎社會證明**:產出 2-3 個 case study(用 req 自身開發 req 的 meta-demo 最有說服力)
4. **分階段推廣管道**:
   - **Phase 1(0-star → 100 star)**:Dev.to 技術文章、HackerNews Show HN、Reddit r/programming / r/LocalLLaMA
   - **Phase 2(100 → 1k star)**:GitHub Discussions、Twitter/X 技術社群、整合示範影片
   - **Phase 3(1k+)**:贊助制(GitHub Sponsors)、企業諮詢、conference talk
5. **重用既有 MDT 基礎設施**但分離內容通道:
   - `content-generator` 新增 `audience: 'developer' | 'enterprise'` 參數
   - `lead-scraper` 新增 dev-channel 來源(GitHub API、Dev.to RSS、HN API)
   - `Interaction` 模型新增 `channel` 欄位
6. **合規考量**:開發者社群資料蒐集需遵循 GitHub ToS、Twitter API ToS、個資法規;貢獻者資料需加密儲存

## 推薦下一步

**recommended next step: proceed to `/req-translate`**,但 `/translate` 必須在第一步透過 `AskUserQuestion` 向使用者確認上述「四個歧義點」,尤其是「商業策略」的真實語意(變現 vs 定位),才能產出正確的 spec。

## 🔒 歧義澄清決策(2026-04-08 人類確認)

以下決策由需求提出者於 `/req-research` 完成後、`/req-translate` 執行前透過 `AskUserQuestion` 明確回答,作為本 spec 的輸入前提:

| # | 歧義點 | 人類決策 | 對 spec 的影響 |
|---|--------|----------|----------------|
| 1 | 「商業策略」的真實語意 | **A — 純品牌定位/推廣打法**(對標 OpenAlice 實況;不設付費機制) | spec 不含付費模組/SaaS 設計;以品牌敘事、社群信任、USP 強化為核心 |
| 2 | 推廣範疇 | **A + C**(採用者獲取 + 社群意見領袖經營);**不含 B 貢獻者招募** | spec 僅需建立 open-source-adopter 與 community-champion 兩個新 persona,不需建立 framework-contributor |
| 3 | 地理/語言範圍 | **雙軸並行**(中文圈 + 英文國際社群同步) | spec 必須納入 i18n 要求:英文 README、英文 landing page、雙語社群內容管線;內容產製器需支援 locale 參數 |
| 4 | 與 market-development-tool 的資源分配 | **深度共用**(緊密重用既有 content-generator / lead-scraper / prisma models / CRM,僅新增「開發者頻道」適配層) | spec 明確宣告 `前置需求: market-development-tool`;新增的 code 限於 dev-channel 適配器與內容風格變體,不得重造輪子 |

**決策鎖定點**:以上四項為 spec 的**不可變**輸入。若未來需變更,必須透過 `/req-iterate` 更新 spec 版本並重新評估 research。

---

## 結構化摘要（供父對話決策使用）

```
## research summary
- intake: intake/raw/2026-04-08-req-promotion-strategy.md
- feature slug: req-promotion-strategy
- autonomy_applied: strict
- duplicates: none
- partial overlaps: market-development-tool (30–40%, shares content/CRM/analytics scaffolding, differs in audience+narrative)
- matched-existing-feature: none (docs/existing-features.md absent, pre-onboarding)
- feasibility: Yellow — cross-project brand narrative split + new dev-channel integrations + strategy ambiguity
- high-risk items:
  - Ambiguity of "business strategy" (OpenAlice actually has no monetization — user may mean positioning)
  - Dev-community platform integrations (GitHub/Dev.to/HN/Twitter APIs, auth & rate-limit)
  - Brand narrative split between enterprise B2B (existing MDT) and developer B2D (new)
- related specs:
  - specs/market-development-tool/spec.md (status: done)
- related code:
  - src/services/content-generator.ts
  - src/services/lead-scraper.ts
  - prisma/schema.prisma
  - src/lib/auth.ts, src/lib/encryption.ts
- related personas (existing):
  - personas/market-developer.md (partial reuse)
  - personas/prospective-client.md (not reusable)
- missing personas to create:
  - open-source framework adopter
  - framework contributor
  - community champion
- recommended next step: proceed to /req-translate (MUST first disambiguate 4 items via AskUserQuestion)
- research.md path: specs/req-promotion-strategy/research.md
```
