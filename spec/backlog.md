# 待確認事項 & 設計決策

## 7.1 後端未整合

| 項目 | 說明 | 影響 |
|------|------|------|
| 探索標籤同步 | 網路失敗時不回滾本地狀態 | 使用者可能看到假成功 |
| 報名欄位對應 | RegistrationModal 欄位需確認與 Prisma schema 一致 | 可能送出欄位名不符 |
| 報名者列表 UI | GET `/activities/:id/participants` 已定義，管理員視圖尚未實作 | 管理員無法查看報名 |
| 成員等級後端 | GET `/clubs/:id/members` 需回傳 `activityCount`；活動結束觸發 `activityCount++` | 目前前端以 id hash mock |

## 7.2 功能不完整

| 項目 | 說明 |
|------|------|
| 訊息後端 | 前端 Polling 規格已確認，後端 `/messages` 路由尚需實作 |
| 相簿頁籤 | UI 架構存在，圖片上傳/排列/刪除邏輯未完整 |
| 語言切換 | SettingsModal 選項為佔位，多語系未實作 |
| 系統管理員 | 無角色設計，需後台時另行擴充 |
| 社團邀請流程 | INVITE 通知類型已定義，邀請 UI + API 尚未實作 |
| 活動評分 | Club 有 `rating` 欄位，使用者評分 UI/API 未實作 |
| 搜尋防抖 | ActivityListPage 有 350ms debounce，HomePage 搜尋列無 |

## 7.3 安全缺口

| 項目 | 說明 |
|------|------|
| 前端路由守衛 | ClubProfilePage 發文、ActivityDetailPage 報名以 `requireAuth()` 處理，直接 URL 訪問可能短暫看到未授權內容 |

## 7.4 體驗缺口

| 項目 | 說明 |
|------|------|
| 空狀態設計 | 搜尋無結果、無通知等空狀態 UI 未確認 |
| Load More vs 自動滾動 | 使用手動按鈕，非 IntersectionObserver |
| 圖片 Lazy Loading | 列表圖片未使用 `loading="lazy"`，首次載入效能較差 |

## 7.5 程式碼 TODO

主要集中於：
- `ExploreTagManagerModal.tsx`：拖曳後端同步邏輯
- `services/api.ts`：部分 mapper 欄位未完整（`bio`、`phone`）
- `ClubProfile.tsx`：相簿佔位實作

---

## 8. 設計決策

| # | 項目 | 決定 |
|---|------|------|
| 1 | 即時通訊 | Polling 每 5 秒，v1 不用 WebSocket |
| 2 | 訊息圖片 | v1 純文字，圖片列未來版本 |
| 3 | 已讀回執 | 未來版本 |
| 4 | 刪除確認 | 統一確認 Modal，禁用 `confirm()` |
| 5 | 篩選持久化 | 同步至 URL query string（`useSearchParams`，`replace: true`） |
| 6 | API 錯誤格式 | `{code, message}` |
| 7 | 圖片上傳限制 | ≤10MB，JPG/PNG/WebP，前後端均驗證 |
| 8 | 圖片儲存 | v1 本地 `uploads/`，未來遷移雲端（不影響 API 介面） |

### URL 篩選參數（/activities）

```
/activities?search=羽球&cities=台北市,新北市&date=2026-05-01&minPrice=0&maxPrice=500&levels=BEGINNER,INTERMEDIATE&isNearlyFull=true
```

| 參數 | 型別 |
|------|------|
| `search` | string |
| `cities` | 逗號分隔 |
| `date` | YYYY-MM-DD |
| `minPrice` / `maxPrice` | number |
| `levels` | 逗號分隔 |
| `isNearlyFull` | boolean string |

### 活動建立表單驗證

| 欄位 | 規則 |
|------|------|
| `title` | 必填，2–50 字元 |
| `date` | 必填，今天以後 |
| `time` | 必填，HH:MM |
| `location` | 必填，2–100 字元 |
| `price` | 必填，整數 ≥0 |
| `level` | 必填，四選一 |
| `mode` | 必填，LIMITED/OPEN |
| `maxParticipants` | LIMITED 必填，≥1 |
| `groups` | OPEN 必填，≥1 組 |
| `description` | 必填，10–2000 字元 |
| `tags` | 選填，≤10 個，每個 ≤20 字元 |
| `image` | 選填，≤10MB，JPG/PNG/WebP |

錯誤顯示：欄位下方紅字 + 送出時滾動至第一個錯誤 + error Toast。
