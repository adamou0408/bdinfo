# 衝突編號：CONFLICT-008

## 狀態：`detected`

## 衝突描述
- **開源框架採用者** 需要:依 US-OSA-001,在任何管道**30 秒內**理解 req 解決什麼問題與和既有工具(Cursor、Copilot、Aider、Cline)的差別;依 US-OSA-002,要能在**15 分鐘內**跑完 quickstart(≤ 5 步、一鍵 docker compose、demo 從 /req-intake 跑到 /req-implement),目的是降低評估成本、快速 go/no-go
- **社群意見領袖** 需要:依 US-CC-002,要能取得「話題性素材包」(media kit)以便在文章/影片/talk 中產出**深度技術內容** — 包含可引用的功能對比表、可嵌入的 demo 片段、品牌描述、可引用的技術 deep dive(於 US-CC-001 中亦提及 exclusive 的技術 deep dive 文件);依 community-champion persona 的核心需求,意見領袖最在乎的是「工具的話題性與差異化」「能成為有趣的內容題材」,需要深度技術細節才能寫出有見解的內容
- **為什麼衝突**:首屏內容(README 上半部、landing page 首屏)是同一塊有限的版面與認知頻寬。30 秒理解 + 15 分鐘 quickstart 的核心要求是「**極簡化**、隱藏複雜度、一句話價值主張、一張圖、一個指令」;媒體 kit 與 deep dive 的核心要求是「**可引用的深度資訊**、對比表、架構細節、roadmap、設計理由」。兩者並非絕對互斥(可放在不同頁面),但 spec 文字明確要求 README 首屏(above the fold)同時呈現「一句話價值主張、一張架構/流程圖、一段 quickstart 指令、Why req? 區段、對比至少 2 個同類工具、雙語、授權、活躍度 badge」 — 這已經接近首屏極限。再加上意見領袖需要「明顯的 media kit 連結」「對比表」「技術 deep dive 入口」也都希望放在顯眼位置,首屏的注意力預算會被嚴重稀釋,30 秒理解的目標難以達成。

## 衝突類型
**UX 衝突**(極簡化 vs 內容豐富) + **資訊架構衝突**(同一塊版面服務兩類受眾)

## 相關 User Stories / NFR
- US-OSA-001(req-promotion-strategy):30 秒內理解、首屏一句話 + 圖 + quickstart + Why req? + 對比 + 雙語 + 授權
- US-OSA-002(req-promotion-strategy):15 分鐘內 quickstart、≤ 5 步、一鍵 docker compose
- US-OSA-003:README 動態 badge(commit、release、issues、contributors)
- US-CC-002(req-promotion-strategy):公開 media kit 資料夾、SVG/PNG logo、品牌色、雙語描述、可引用的功能對比表、demo GIF、明顯的 media kit 連結
- US-CC-001:exclusive 的技術 deep dive 文件
- community-champion persona:最在乎話題性 + 差異化 + 深度技術內容
- open-source-adopter persona:最在乎 30 秒理解 + 15 分鐘上手 + 文件完整

## AI 分析
這是 spec 中典型的「不同 persona 競爭同一塊認知版面」UX 衝突,且兩種 persona 都把目光投向 README 與 landing page 首屏:

1. **首屏注意力預算的硬限制**:30 秒可閱讀的英文約 75 ~ 100 個字 + 1 張圖 + 1 行指令。spec 明列的首屏元素(一句話價值主張 + 圖 + quickstart + Why req? + 兩個對比 + 雙語 + 授權 + badges)已經超出 30 秒可吸收的量級。再加上 media kit 連結、deep dive 入口、對比表縮圖,首屏會變成「資訊牆」,反而違反 30 秒理解的目標。
2. **兩類受眾的閱讀行為不同**:adopter 是「掃讀 30 秒 → 跑 quickstart → 決定」,champion 是「研究數小時 → 寫文章 → 發表」。前者需要結論先行(top-down),後者需要素材豐富(reference-heavy)。把兩種閱讀模式塞進同一頁面,任何一邊都會被迫適應另一邊的節奏。
3. **「對比表」的雙重身份**:adopter 需要的對比是「3 行內看完、結論明確」(US-OSA-001 的 Why req? 對比至少 2 個同類工具);champion 需要的對比是「可引用的詳細表格、欄位多、有引用來源、可截圖」(US-CC-002 的 media kit 對比圖表)。同一份對比表很難同時滿足兩種需求。
4. **deep dive 與 quickstart 的張力**:champion 想要技術 deep dive,quickstart 卻刻意隱藏底層細節以求 15 分鐘可完成。若 deep dive 鏈接放在 quickstart 旁邊,會誘導 adopter 在試用前先讀 deep dive,反而拉長 evaluation cycle,違反 US-OSA-002 的精神;若放在另一個獨立區塊,champion 可能找不到。
5. **雙語的版面成本**:NFR 要求 README 與 landing page 雙語(英文 primary + 繁中對照),若兩種語言版本都要塞入上述所有元素,首屏的版面壓力會加倍,加劇衝突。
6. **與成功指標的耦合**:成功指標 1(GitHub star 3 倍)主要由 adopter 驅動,需要極簡化首屏;成功指標 3(意見領袖主動產出內容)主要由 champion 驅動,需要豐富素材。同一份 README 同時最佳化兩個指標的可能性不高。
7. **與 CONFLICT-006 的耦合**:若意見領袖的 deep dive 是 exclusive(只給特定人),則不需要佔 README 版面;若是公開,則必然爭搶首屏注意力。CONFLICT-006 的解法會直接影響本衝突的嚴重程度。

## 解決方案
- [ ] 方案 1:**受眾分頁 — README 與 landing page 完全為 adopter 最佳化,media kit 與 deep dive 移至獨立頁面**(優先滿足 US-OSA-001/002 的 30 秒/15 分鐘要求)。README 首屏只保留:一句話 USP、一張圖、quickstart 指令、Why req?(最多 3 行)、授權 badge。media kit 與 deep dive 放在 `docs/media-kit/`、`docs/deep-dive/` 獨立頁面,在 README 底部以一行小字連結。代價:US-CC-002 的「明顯的 media kit 連結」字面驗收條件無法達成;意見領袖的發現成本上升(可能找不到 deep dive)。
- [ ] 方案 2:**版面分區 — 同一頁面內以視覺分區處理兩種受眾**(優先滿足 US-CC-002 的「明顯」要求 + US-OSA 的核心訊息)。README 首屏依然極簡(3 元素:USP、圖、quickstart),但在第二屏 ~ 第三屏明確分區:「For developers evaluating req」「For content creators / champions」,各自有獨立的入口連結與素材包。對比表做兩份:首屏的「3 行對比 cards」與 deep dive 頁面的「完整功能矩陣」。代價:版面複雜度上升,雙語維護成本加倍;且 30 秒理解的計時口徑需要明確定義為「首屏」而非「整個 README 頁面」。
- [ ] 方案 3:**兩個入口頁 — landing page 只服務 adopter,獨立的 press / media 頁服務 champion**(折衷方案)。GitHub README 與品牌 landing page 都極簡化(以 adopter 為唯一受眾,嚴格符合 30 秒/15 分鐘要求),另外建立獨立的 `req.dev/press`(或 `docs/press/`)頁面,集中放置 media kit、deep dive、roadmap、exclusive 訪談連結、可引用素材,並在 README 與 landing page 的 footer 提供顯眼但非首屏的入口。意見領袖的外展訊息(US-CC-001)中直接附上 press 頁面連結,確保意見領袖能找到。代價:需要新增與維護第三個獨立頁面(超出原本「README + landing page」的範疇),且 press 頁面的雙語維護是額外負擔(進一步加劇 CONFLICT-007 的人力衝突)。

## 決策紀錄
- **決策者**:（待定)
- **決策日期**:（待定)
- **選擇方案**:（待定)
- **理由**:（待定)
