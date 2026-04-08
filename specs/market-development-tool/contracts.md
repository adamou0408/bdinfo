# API 合約：持續開拓市場工具（Market Development Tool）

## 對應規格
- Spec: [spec.md](./spec.md)
- Plan: [plan.md](./plan.md)

---

## API 端點

### `GET /api/leads`
- **描述**：取得潛在客戶名單（分頁、篩選、搜尋）
- **認證**：需要
- **權限**：market_developer, admin
- **請求參數**：
  | 參數 | 型別 | 必填 | 說明 |
  |------|------|------|------|
  | page | number | 否 | 頁碼，預設 1 |
  | limit | number | 否 | 每頁筆數，預設 20 |
  | industry | string | 否 | 產業篩選 |
  | pipeline_stage | string | 否 | 管道階段篩選 |
  | search | string | 否 | 關鍵字搜尋 |
  | sort_by | string | 否 | 排序欄位（created_at, last_interaction_at） |
- **回應範例**：
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "company_name": "大同製造股份有限公司",
        "industry": "製造業",
        "scale": "中型（50-200人）",
        "source": "商工登記",
        "digital_maturity": "低",
        "pipeline_stage": "discovered",
        "last_interaction_at": null,
        "created_at": "2026-04-06T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 150 }
  }
  ```
- **錯誤碼**：
  | 狀態碼 | 說明 |
  |--------|------|
  | 401 | 未認證 |
  | 403 | 無權限 |

### `GET /api/leads/:id`
- **描述**：取得單一潛在客戶詳情（含聯絡方式、互動紀錄）
- **認證**：需要
- **權限**：market_developer, admin
- **回應範例**：
  ```json
  {
    "id": "uuid",
    "company_name": "大同製造股份有限公司",
    "industry": "製造業",
    "scale": "中型（50-200人）",
    "contact_info": { "phone": "02-xxxx-xxxx", "email": "info@example.com" },
    "source": "商工登記",
    "source_url": "https://...",
    "digital_maturity": "低",
    "pipeline_stage": "contacted",
    "privacy_notice_sent": true,
    "tags": ["製造業", "ERP需求"],
    "interactions": [
      {
        "id": "uuid",
        "type": "message",
        "channel": "LINE",
        "summary": "初次接觸，介紹服務",
        "result": "已讀，待回覆",
        "created_at": "2026-04-07T10:00:00Z"
      }
    ],
    "last_interaction_at": "2026-04-07T10:00:00Z"
  }
  ```

### `PATCH /api/leads/:id`
- **描述**：更新潛在客戶資訊（管道階段、標籤等）
- **認證**：需要
- **權限**：market_developer, admin
- **請求範例**：
  ```json
  {
    "pipeline_stage": "communicating",
    "tags": ["製造業", "ERP需求", "高優先"]
  }
  ```

### `POST /api/leads/:id/interactions`
- **描述**：新增互動紀錄
- **認證**：需要
- **權限**：market_developer, admin
- **請求範例**：
  ```json
  {
    "type": "meeting",
    "channel": "LINE 視訊",
    "summary": "討論 ERP 升級需求",
    "result": "客戶有興趣，需要提案"
  }
  ```

### `GET /api/leads/export`
- **描述**：匯出潛在客戶名單（CSV）
- **認證**：需要
- **權限**：market_developer, admin
- **備註**：觸發審計日誌記錄

---

### `GET /api/content`
- **描述**：取得社群內容列表
- **認證**：需要
- **權限**：market_developer, admin
- **請求參數**：
  | 參數 | 型別 | 必填 | 說明 |
  |------|------|------|------|
  | status | string | 否 | 狀態篩選（draft, pending_review, approved, published） |
  | content_type | string | 否 | 內容類型篩選 |

### `POST /api/content/generate`
- **描述**：使用 AI 產生社群內容草稿
- **認證**：需要
- **權限**：market_developer, admin
- **請求範例**：
  ```json
  {
    "content_type": "industry_insight",
    "target_industry": "製造業",
    "topic": "傳統製造業導入 AI 品檢的效益",
    "tone": "專業但易懂"
  }
  ```
- **回應範例**：
  ```json
  {
    "id": "uuid",
    "title": "傳統製造業如何用 AI 品檢提升良率？",
    "body": "...(AI 產生的內容)...",
    "content_type": "industry_insight",
    "status": "draft",
    "ai_generated": true
  }
  ```

### `PATCH /api/content/:id`
- **描述**：更新內容（編輯、審核、排程）
- **認證**：需要
- **權限**：market_developer, admin
- **請求範例**：
  ```json
  {
    "status": "approved",
    "scheduled_at": "2026-04-10T09:00:00+08:00",
    "platform": "facebook"
  }
  ```

### `POST /api/content/:id/publish`
- **描述**：立即發布內容至社群平台
- **認證**：需要
- **權限**：market_developer, admin
- **前置條件**：status 必須為 `approved`

---

### `GET /api/pipeline/summary`
- **描述**：取得管道階段統計摘要（用於儀表板漏斗圖）
- **認證**：需要
- **權限**：market_developer, admin
- **回應範例**：
  ```json
  {
    "stages": {
      "discovered": 45,
      "contacted": 12,
      "communicating": 8,
      "proposed": 3,
      "closed_won": 1,
      "closed_lost": 2
    },
    "follow_up_needed": 5
  }
  ```

### `GET /api/pipeline/reminders`
- **描述**：取得需要跟進的客戶提醒清單
- **認證**：需要
- **權限**：market_developer, admin
- **請求參數**：
  | 參數 | 型別 | 必填 | 說明 |
  |------|------|------|------|
  | days_inactive | number | 否 | 未互動天數閾值，預設 7 |

---

### `GET /api/insights`
- **描述**：取得市場洞察報告列表
- **認證**：需要
- **權限**：market_developer, admin

### `GET /api/insights/latest`
- **描述**：取得最新的每週市場洞察摘要
- **認證**：需要
- **權限**：market_developer, admin
- **回應範例**：
  ```json
  {
    "id": "uuid",
    "report_type": "weekly_summary",
    "period_start": "2026-03-30",
    "period_end": "2026-04-06",
    "summary": "本週傳統製造業的 AI 需求持續成長，尤其在品質檢測和庫存管理...",
    "data": {
      "top_industries": ["製造業", "物流業", "營建業"],
      "trend": "上升",
      "new_leads_count": 23,
      "hot_topics": ["AI品檢", "ERP升級", "數位轉型補助"]
    }
  }
  ```

---

### `GET /api/portfolio` (公開)
- **描述**：取得公開案例列表（不需認證）
- **認證**：不需要
- **權限**：公開
- **回應範例**：
  ```json
  {
    "cases": [
      {
        "id": "uuid",
        "title": "某製造公司 AI 品檢系統",
        "client_industry": "製造業",
        "problem_description": "人工品檢效率低、漏檢率高",
        "solution_description": "導入 AI 影像辨識品檢系統",
        "results": "良率提升 15%，品檢速度提升 3 倍",
        "testimonial": "非常滿意，大幅降低了我們的品檢成本。"
      }
    ]
  }
  ```

### `POST /api/portfolio` (管理)
- **描述**：新增案例
- **認證**：需要
- **權限**：admin, market_developer

### `PATCH /api/portfolio/:id` (管理)
- **描述**：更新案例
- **認證**：需要
- **權限**：admin, market_developer

---

### `GET /api/privacy/data-request?email=xxx`
- **描述**：供潛在客戶查詢自己被蒐集的資料
- **認證**：不需要（但需驗證 email 所有權）
- **權限**：公開（限本人資料）
- **備註**：觸發審計日誌；需 email 驗證碼確認身分

### `POST /api/privacy/data-deletion`
- **描述**：供潛在客戶請求刪除自己的資料
- **認證**：不需要（但需驗證 email 所有權）
- **請求範例**：
  ```json
  {
    "email": "contact@example.com",
    "verification_code": "123456"
  }
  ```
- **備註**：觸發審計日誌；30 天內執行刪除

---

## 資料模型

### Lead（潛在客戶）
| 欄位 | 型別 | 必填 | 說明 | 約束 |
|------|------|------|------|------|
| id | UUID | 是 | 主鍵 | PK |
| company_name | VARCHAR(255) | 是 | 企業名稱 | |
| industry | VARCHAR(100) | 否 | 產業類別 | |
| scale | VARCHAR(50) | 否 | 企業規模 | |
| contact_info | JSONB | 否 | 聯絡方式（AES-256 加密） | |
| source | VARCHAR(100) | 是 | 資料來源 | |
| pipeline_stage | ENUM | 是 | 管道階段 | DEFAULT 'discovered' |
| privacy_notice_sent | BOOLEAN | 是 | 已告知隱私政策 | DEFAULT false |
| last_interaction_at | TIMESTAMP | 否 | 最後互動時間 | |
| expires_at | TIMESTAMP | 否 | 過期時間 | 12個月未互動 |

### Interaction（互動紀錄）
| 欄位 | 型別 | 必填 | 說明 | 約束 |
|------|------|------|------|------|
| id | UUID | 是 | 主鍵 | PK |
| lead_id | UUID | 是 | 關聯客戶 | FK → leads |
| type | ENUM | 是 | 互動類型 | |
| channel | VARCHAR(50) | 否 | 互動管道 | |
| summary | TEXT | 否 | 摘要 | |
| result | TEXT | 否 | 結果 | |

### Content（社群內容）
| 欄位 | 型別 | 必填 | 說明 | 約束 |
|------|------|------|------|------|
| id | UUID | 是 | 主鍵 | PK |
| title | VARCHAR(255) | 是 | 標題 | |
| body | TEXT | 是 | 內容本文 | |
| content_type | ENUM | 是 | 內容類型 | |
| status | ENUM | 是 | 狀態 | DEFAULT 'draft' |
| scheduled_at | TIMESTAMP | 否 | 排程發布時間 | |
| platform | VARCHAR(50) | 否 | 發布平台 | |
| engagement_metrics | JSONB | 否 | 互動數據 | |

### 模型間關係
- Lead 1:N Interaction（一個客戶有多筆互動）
- User 1:N Interaction（一個使用者建立多筆互動）
- Content 獨立，不直接關聯 Lead（內容行銷面向所有潛在客戶）

## 向後相容性
- 此為全新 API，無既有客戶端，無向後相容需求
- 所有端點以 `/api/` 為前綴，預留未來版本空間
