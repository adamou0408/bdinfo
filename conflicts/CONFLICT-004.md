# 衝突編號：CONFLICT-004

## 狀態：`detected`

## 衝突描述
- **市場開發者（req 推廣執行者）** 需要：`content-generator` 同步產出英文 + 繁體中文雙語內容,且英文為 primary,以觸及英文國際社群（US-MD-011、req-promotion-strategy NFR「i18n 雙軸」)
- **市場開發者（既有 MDT 使用者）** 需要：既有 market-development-tool v2.1 的非功能需求明確宣告「語言：繁體中文（zh-TW）」,所有共用元件的語言行為以繁中為唯一輸出
- **為什麼衝突**：本 spec 採取「深度共用」策略（research 決策 #4)直接重用既有 `content-generator`,但既有 MDT spec v2.1 的 NFR 將語言鎖定為繁中。為新 spec 加上 `locale` 參數雖在程式介面層可以視為向後相容的擴充,但 (a) 改動會落在 MDT 已 `done` 的模組上,違反 v2.1 的非功能需求文字 (b) 既有 MDT 的內容範本、prompt、品牌敘事都是以繁中為單一語境設計,單純加參數不能保證英文輸出品質與品牌一致性 (c) 「英文為 primary」的成功指標（≥1:1 雙軸平衡)會反過來壓迫既有 MDT 的繁中內容排程。

## 衝突類型
**功能衝突**（單語 vs 雙語）+ **跨 spec 非功能需求衝突**（既有 NFR 鎖定 zh-TW vs 新 spec 要求 en+zh-TW）

## 相關 User Stories / NFR
- US-MD-011（req-promotion-strategy）：content-generator 新增 `locale` 參數,雙軸同步產出 en/zh-TW
- req-promotion-strategy NFR「i18n 雙軸」：英文為 primary
- market-development-tool v2.1 NFR「語言：繁體中文（zh-TW）」
- 成功指標 4：英中內容產出比 ≥ 1:1

## AI 分析
這是「深度共用」策略的第一個結構性張力。表面上「加一個 locale 參數」是純粹的擴充式變更,但深層問題是：

1. **NFR 是宣告式約束,不是預設值**：MDT v2.1 的「語言：繁體中文」並非「目前只實作繁中,未來可擴充」,而是 spec 擁有者明確簽核的範圍邊界。在未經 `/req-iterate` 更新 MDT spec 的情況下直接擴充其能力,等同於讓一個 `done` 的 spec 在背後改變定義。
2. **prompt 工程的非對稱性**：既有 MDT 的 content-generator prompts 假設目標讀者是繁中圈傳統產業決策者,語氣、案例引用、文化脈絡都是針對該讀者最佳化。直接套用相同 prompt 結構產出英文,輸出品質會遠低於針對英文開發者社群重新設計的 prompt。「加 locale 參數」隱藏了「需要重寫整套 prompt 模板」的真實工作量。
3. **內容排程的零和競爭**：若新 spec 要求英中比 ≥ 1:1,而市場開發者的時間有限（見 CONFLICT-007）,英文內容的產出時數會直接擠壓既有 MDT 繁中內容的排程,進而影響 MDT 的成功指標 1（每週 20 個潛在客戶名單）與指標 2（社群內容互動率）。
4. **「相容擴充」vs「破壞性變更」的判定**：純技術角度,加 `locale` 參數對既有呼叫端是相容的（預設值仍為 zh-TW)。但從產品語意角度,既有 MDT 的「繁中唯一」是一個刻意決策,不是技術限制。

## 解決方案
- [ ] 方案 1：**硬隔離 — 新建獨立的 dev-channel content generator**（優先滿足既有 MDT NFR 邊界）。不修改既有 `content-generator`,而是在 dev-channel 適配層中新增一個 `dev-content-generator` 子模組,內部可重用 prompt 工程的共用工具函式,但雙語邏輯與英文 prompt 模板完全獨立於 MDT 的繁中產生器。代價：違反 research 決策 #4 的「深度共用」精神,程式重複度上升。
- [ ] 方案 2：**透過 `/req-iterate` 升級 MDT spec 至 v3.0,正式擴充其 NFR 為雙語**（優先滿足新 spec 的雙語需求 + 保留深度共用）。重新審核 MDT,將「語言：繁體中文」改寫為「核心語言：繁中;對外內容支援 locale 參數,可選 en/zh-TW」,並重新跑一次 review/implement。代價：MDT 從 `done` 退回 `in-progress`,延後本 spec 的執行;且需確認既有 14/14 任務不會因為 NFR 變更而被視為未涵蓋。
- [ ] 方案 3：**雙層架構 — 共用核心,分離模板**（折衷方案）。`content-generator` 保留為共用核心引擎（負責呼叫 LLM、metadata 標記、人工確認流程),但「語言模板」與「prompt context」依 audience 拆成兩個資料夾：`templates/enterprise-zh/` 與 `templates/dev-en/`、`templates/dev-zh/`。MDT NFR 的「繁中」改解讀為「企業客戶模板使用繁中」而非「整個產生器只能輸出繁中」。需要 MDT spec 擁有者書面確認此語意調整不算 NFR 變更（仍可能需要走輕量 `/req-iterate`)。

## 決策紀錄
- **決策者**：（待定）
- **決策日期**：（待定）
- **選擇方案**：（待定)
- **理由**：（待定）
