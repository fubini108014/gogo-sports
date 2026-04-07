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

## 7.6 未來擴充規劃 (Tier 4)

| 項目 | 說明 | 狀態 |
|------|------|------|
| 地圖標記聚合 | 使用 Leaflet.markercluster 實作分群聚合，解決同場地多活動重疊問題 | 待實作 |
| WebSocket 預留 | 後端 API 需預留 Socket.io 事件觸發，前端 Hook 需預留即時更新介面 | 規劃中 |
| 圖片自動優化 | 上傳後由後端/CDN 自動轉為 WebP 並產生三種尺寸（Original, Medium, Thumbnail） | 待實作 |
| 多國語系 | 暫僅支援繁體中文，語法結構保留 i18n 遷移空間 | 已確認 |

---

## 8. 設計決策 (Updated)

| # | 項目 | 決定 |
|---|------|------|
| 1 | 即時通訊 | v1 Polling 每 5 秒，後端預留 WebSocket 事件鉤子 |
| 2 | 訊息圖片 | v1 純文字，圖片列未來版本 |
| 3 | 圖片壓縮 | 統一轉 WebP，限制 ≤10MB，前端上傳前先行預縮圖 (可選) |
| 4 | 地圖互動 | 點擊標記聚合圈展開，點擊單一標記顯示 Popup |
| 5 | 報名遞補 | 方案 A：有人取消時，系統依報名順序自動遞補 `WAITLISTED` 者 |
| 6 | 懲罰機制 | 惡意缺席者由主揪手動標記，扣除 XP (不可回復) |

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
