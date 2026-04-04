# GoGo Sports — 完整規格書

> 版本：v1.1 | 產出日期：2026-04-04 | 最後更新：2026-04-04 | 語言：繁體中文

---

## 1. 專案概述

### 系統目標

**GoGo Sports** 是一個台灣運動社群揪團平台，目標是讓有相同運動興趣的人能快速找到活動、加入社團、並認識同好。平台提供活動發現、報名管理、社團經營、社群互動等完整功能。

### 使用者角色

| 角色 | 說明 | 主要功能 |
|------|------|----------|
| **訪客（未登入）** | 未登入的使用者 | 瀏覽活動、瀏覽社團（無法報名或加入） |
| **一般會員** | 已登入的普通使用者 | 搜尋/報名活動、加入社團、發文留言、接收通知 |
| **社團管理員** | 擁有或被指派管理社團的會員 | 新增活動、管理成員、發公告、刪除貼文/留言 |
| **系統管理員** | 後台管理者（目前未實作） | 未來擴充：審核社團、停權使用者 |

---

## 2. 技術架構

### 前端

| 項目 | 技術 |
|------|------|
| 框架 | React 19.2.4 + TypeScript |
| 建置工具 | Vite |
| 樣式 | Tailwind CSS（Dark Mode 支援） |
| 路由 | React Router v6（BrowserRouter） |
| 狀態管理 | React Context（AppContext） |
| 地圖 | React-Leaflet + Leaflet（OpenStreetMap） |
| 圖示 | Lucide React |
| 拖曳排序 | dnd-kit |
| 資料驗證 | Zod（回應驗證） |

### 後端

| 項目 | 技術 |
|------|------|
| 框架 | Fastify 4.28.1 + TypeScript |
| ORM | Prisma |
| 資料庫 | PostgreSQL（支援 SQLite 開發） |
| 認證 | JWT（存取 Token + 更新 Token） |
| 安全性 | @fastify/helmet、@fastify/cors、rate-limit（100 req/min） |
| 檔案上傳 | @fastify/multipart、@fastify/static |
| 密碼雜湊 | bcryptjs |
| 資料驗證 | Zod |

### 部署環境

| 項目 | 設定 |
|------|------|
| 前端開發 | `npm run dev`（port 5173） |
| 前端建置 | `npm run build` → `dist/` |
| 後端開發 | `npm run dev`（tsx watch，port 3000） |
| 後端建置 | TypeScript 編譯 |
| 資料庫遷移 | `npm run db:migrate` |
| API Base URL | `http://localhost:3000/v1` |
| 圖片儲存（v1） | 本地 `backend/uploads/` 目錄，透過 `/static/uploads/:filename` 提供存取 |
| 圖片儲存（未來） | 預計遷移至雲端物件儲存（如 AWS S3 / GCS），不影響 API 介面 |

---

## 3. 資料模型

### 3.1 列舉型別（Enums）

#### RegistrationMode — 報名模式
| 值 | 說明 |
|----|------|
| `LIMITED` | 固定名額制（如羽球、籃球），有 `maxParticipants` 上限 |
| `OPEN` | 開放分組制（如登山、跑步），依「組別」報名 |

#### ActivityStatus — 活動狀態
| 值 | 顯示文字 | 說明 |
|----|----------|------|
| `OPEN` | 報名中 | 開放報名 |
| `FULL` | 已額滿 | 達到上限，可候補 |
| `CANCELLED` | 已取消 | 活動取消 |
| `ENDED` | 已結束 | 活動完成 |

#### Level — 難度等級
| 值 | 顯示文字 |
|----|----------|
| `BEGINNER` | 新手友善 |
| `INTERMEDIATE` | 中階 |
| `ADVANCED` | 高階 |
| `PRO` | 專業 |

#### PostType — 貼文類型
| 值 | 顯示文字 |
|----|----------|
| `ANNOUNCEMENT` | 公告 |
| `SHARE` | 閒聊 |
| `PHOTO` | 相簿 |

#### NotificationType — 通知類型
| 值 | 說明 |
|----|------|
| `SYSTEM` | 系統公告 |
| `ACTIVITY` | 活動提醒／更新 |
| `INTERACTION` | 貼文互動（留言、按讚） |
| `INVITE` | 社團邀請 |

---

### 3.2 核心資料模型

#### Activity — 活動

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `clubId` | string | 所屬社團 ID |
| `title` | string | 活動標題 |
| `date` | string | 活動日期（YYYY-MM-DD） |
| `time` | string | 活動時間（HH:MM） |
| `location` | string | 地點名稱 |
| `price` | number | 費用（0 = 免費） |
| `mode` | RegistrationMode | 報名模式 |
| `status` | ActivityStatus | 活動狀態 |
| `maxParticipants` | number? | 最大名額（LIMITED 模式） |
| `currentInternalCount` | number? | 內部報名人數（LIMITED 模式） |
| `currentAppCount` | number? | App 報名人數（LIMITED 模式） |
| `groups` | string[]? | 組別名稱列表（OPEN 模式，如「5分速」） |
| `level` | Level | 難度等級 |
| `image` | string | 封面圖片 URL |
| `description` | string | 活動描述 |
| `tags` | string[] | 標籤列表 |
| `lat` | number? | 緯度（地圖用） |
| `lng` | number? | 經度（地圖用） |

#### Club — 社團

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `name` | string | 社團名稱 |
| `logo` | string | Logo 圖片 URL |
| `rating` | number | 評分（0-5） |
| `membersCount` | number | 成員人數 |
| `description` | string | 社團描述 |
| `tags` | string[] | 標籤列表 |

#### User — 使用者

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `name` | string | 顯示名稱 |
| `avatar` | string | 頭像圖片 URL |
| `isClubAdmin` | boolean | 是否為社團管理員 |
| `registeredActivityIds` | string[] | 已報名的活動 ID 列表 |
| `joinedClubIds` | string[] | 已加入的社團 ID 列表 |
| `managedClubIds` | string[] | 管理中的社團 ID 列表 |

#### Post — 貼文

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `clubId` | string | 所屬社團 ID |
| `author` | object | `{id, name, avatar, isAdmin}` |
| `type` | PostType | 貼文類型 |
| `content` | string | 貼文內容 |
| `images` | string[]? | 圖片 URL 列表（PHOTO 類型） |
| `createdAt` | string | 建立時間（ISO 格式） |
| `likes` | number | 按讚數 |
| `comments` | number | 留言數 |
| `isLiked` | boolean | 目前使用者是否已按讚 |

#### CommentItem — 留言

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `postId` | string | 所屬貼文 ID |
| `parentId` | string? | 父留言 ID（null 為頂層留言） |
| `author` | object | `{id, name, avatar}` |
| `content` | string | 留言內容 |
| `createdAt` | string | 建立時間（ISO 格式） |
| `replies` | CommentItem[] | 子留言列表（巢狀） |

#### Notification — 通知

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `type` | NotificationType | 通知類型 |
| `title` | string | 通知標題 |
| `content` | string | 通知內容 |
| `time` | string | 相對時間（如「5 分鐘前」） |
| `isRead` | boolean | 是否已讀 |
| `linkId` | string? | 關聯 ID（活動 ID 或社團 ID） |

#### ExploreTag — 探索標籤

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `label` | string | 顯示標籤名稱 |
| `icon` | string | Emoji 圖示 |
| `colorKey` | string | 顏色主題（8 種預設） |
| `filters` | ExploreTagFilters | 對應的篩選條件 |
| `isSystem` | boolean | 是否為系統預設標籤（不可刪除） |
| `enabled` | boolean | 是否顯示於首頁 |

#### FilterState — 篩選條件

| 欄位 | 型別 | 說明 |
|------|------|------|
| `cities` | string[] | 縣市列表（台灣 22 縣市） |
| `date` | string | 日期篩選 |
| `minPrice` | string | 最低費用 |
| `maxPrice` | string | 最高費用 |
| `levels` | string[] | 難度等級列表 |
| `isNearlyFull` | boolean | 只顯示快額滿 |

---

## 4. 已完成功能清單

### 4.1 認證模組

| 功能 | 行為說明 |
|------|----------|
| 會員登入 | 輸入 Email + 密碼，取得 JWT Access Token + Refresh Token，存入 localStorage |
| 會員註冊 | 輸入姓名、Email、密碼（≥8字元）、電話（選填），建立帳號 |
| 自動登入 | App 啟動時若 localStorage 有 token，自動呼叫 `/users/me` 還原登入狀態 |
| Token 自動更新 | API 回傳 401 時，自動用 Refresh Token 換新 Access Token，最多重試一次 |
| 登出 | 清除 localStorage 中的所有 token，清空 context 使用者狀態 |
| 登入守衛 | `requireAuth()` — 未登入時阻擋動作並開啟登入 Modal |

### 4.2 活動探索模組

| 功能 | 行為說明 |
|------|----------|
| 首頁搜尋 | 以關鍵字搜尋活動標題、地點、標籤 |
| 地點篩選 | 可選「全台灣」或指定多個縣市（22 縣市 + 離島） |
| 運動分類篩選 | 10 大主類別 × 多個子類別（如「球類運動 > 羽球」） |
| 探索標籤 | 首頁快速篩選卡片（即將額滿、新手友善、百元有找 等 7 個預設 + 自訂） |
| 探索標籤管理 | 新增、編輯、刪除、啟用/停用、拖曳排序標籤，同步至後端 |
| 活動列表 | 無限滾動（Load More），每次顯示 +6 筆 |
| 進階篩選 | 縣市、日期、費用區間（滑桿）、難度、快額滿，即時更新列表 |
| 搜尋高亮 | 搜尋結果中符合關鍵字的文字以橘色高亮顯示 |
| 地圖視圖 | 切換為 Leaflet 地圖，顯示活動位置標記（橘色），點擊 Popup 可查看詳情 |
| 骨架屏 | 資料載入期間顯示 skeleton 佔位元件（700ms 模擬延遲） |

### 4.3 活動詳情模組

| 功能 | 行為說明 |
|------|----------|
| 活動詳情頁 | 顯示大圖、狀態徽章、所屬社團卡片、日期時間地點費用、描述、標籤 |
| 報名狀態顯示 | LIMITED 模式顯示進度條（已報 N/M）；OPEN 模式顯示參加人數頭像 |
| 小地圖 | 活動詳情頁底部嵌入 Leaflet 地圖（有座標時顯示） |
| 一鍵報名入口 | 按「立即報名」開啟 RegistrationModal |

### 4.4 報名模組

| 功能 | 行為說明 |
|------|----------|
| 三步驟報名 | Step 1 選組別（OPEN）＋交通方式；Step 2 填寫個人資料；Step 3 確認送出 |
| 組別選擇 | OPEN 模式可選擇分組（如「5分速」「6分速」） |
| 個人資料收集 | 真實姓名、聯絡電話、緊急聯絡人姓名與電話 |
| 候補說明 | 活動已額滿時顯示候補說明，仍可送出 |
| 報名成功回饋 | 成功後顯示 Toast 通知，活動加入「我的活動」 |
| 取消報名 | 在個人頁面可取消報名，並從 `myActivityIds` 移除 |

### 4.5 社團模組

| 功能 | 行為說明 |
|------|----------|
| 社團列表 | 顯示社團卡片（Logo、名稱、評分、人數、標籤），骨架屏支援 |
| 社團頁面 | 三個頁籤：社群（貼文）、活動（社團活動列表）、相簿 |
| 加入社團 | 點擊「加入社團」更新 `joinedClubIds`，顯示 Toast 通知 |
| 退出社團 | 點擊「退出社團」更新 `joinedClubIds`，顯示 Toast 通知 |
| 活動月曆 | 社團頁籤「活動」中顯示週/月/年視圖切換的日曆 |
| 社團管理（管理員） | 編輯名稱、描述、Logo、標籤，管理成員（踢除），刪除社團 |
| 成員等級徽章 | 社團成員列表與個人資料卡上顯示依參加活動次數計算的等級徽章 |

#### 成員等級制度（Club Member Rank）

依照成員在**該社團**累積參與的活動次數，自動計算等級，顯示於社團成員列表與活動參與者清單。

| 等級 | 稱號 | 門檻（活動次數） | 徽章顏色 |
|------|------|----------------|---------|
| 1 | 新手 🌱 | 0–2 次 | 灰色 `gray` |
| 2 | 熟手 ⚡ | 3–9 次 | 藍色 `blue` |
| 3 | 老手 🔥 | 10–19 次 | 橘色 `orange` |
| 4 | VIP 👑 | 20 次以上 | 金色 `yellow` |

**計算規則**
- 以**社團為單位**計算，跨社團不合併（A 社團老手不代表 B 社團老手）
- 後端：`ClubMember.activityCount` 欄位；前端 mock data 以隨機值模擬
- 等級僅供展示，不影響報名或功能權限

**UI 顯示位置**
1. 社團成員列表（管理員 → 管理成員）：名字右側顯示等級徽章
2. 貼文/留言作者頭像旁：顯示小型等級 icon
3. 個人資料頁「已加入社團」卡片：顯示在該社團的等級

**資料模型異動**

```ts
// types.ts
export enum ClubMemberRank {
  NEWBIE     = 'NEWBIE',      // 新手 🌱  0–2
  REGULAR    = 'REGULAR',     // 熟手 ⚡  3–9
  VETERAN    = 'VETERAN',     // 老手 🔥  10–19
  VIP        = 'VIP',         // VIP 👑   20+
}

export interface ClubMember {
  id: string;
  name: string;
  avatar: string;
  email: string;
  joinedAt: string;
  activityCount: number;   // 在該社團參與的活動次數
  rank: ClubMemberRank;    // 由 activityCount 導出，可存 DB 或前端即算
}

// 純函式：由次數算等級
export function calcClubMemberRank(count: number): ClubMemberRank {
  if (count >= 20) return ClubMemberRank.VIP;
  if (count >= 10) return ClubMemberRank.VETERAN;
  if (count >= 3)  return ClubMemberRank.REGULAR;
  return ClubMemberRank.NEWBIE;
}
```

**後端 API 異動（未來實作）**
- `GET /clubs/:id/members` 回應增加 `activityCount` 與 `rank` 欄位
- 每次活動結束（status → ENDED）觸發 `ClubMember.activityCount++`

### 4.6 社群互動模組

| 功能 | 行為說明 |
|------|----------|
| 發文 | 選擇貼文類型（公告/閒聊/相簿），輸入內容、上傳圖片 |
| 貼文篩選 | 依貼文類型篩選（全部、公告、閒聊、相簿） |
| 貼文排序 | 最新在前 / 最早在前切換 |
| 按讚 | 按讚/取消按讚，即時更新按讚數（local state） |
| 巢狀留言 | 頂層留言 + 對留言回覆（parentId 關聯），最多兩層 |
| 編輯/刪除貼文 | 管理員可對任意貼文編輯或刪除 |
| 刪除留言 | 管理員可對任意留言進行刪除 |

### 4.7 個人中心模組

| 功能 | 行為說明 |
|------|----------|
| 個人頁面 | 顯示頭像、名稱、已報名活動、已加入社團 |
| 取消報名 | 在個人頁面活動卡片上點擊取消，立即從清單移除 |
| 退出社團 | 在個人頁面社團卡片上點擊退出 |
| 編輯資料 | 修改名稱、頭像（呼叫 PATCH /users/me） |
| 設定 | 開啟 SettingsModal 可切換 Dark Mode、語言（佔位）、登出 |

### 4.8 通知模組

| 功能 | 行為說明 |
|------|----------|
| 通知列表 | 顯示所有通知，未讀以深色背景標記 |
| 一鍵全讀 | 點擊「全部標為已讀」更新所有通知狀態 |
| 點擊跳轉 | ACTIVITY 通知跳轉至活動詳情；INVITE/INTERACTION 跳轉至社團頁面 |
| 未讀數量徽章 | 頂部 Nav 鈴鐺圖示顯示未讀數量紅點 |

### 4.9 系統功能

| 功能 | 行為說明 |
|------|----------|
| Dark Mode | 全站深色模式，Tailwind `dark:` class，localStorage 持久化 |
| Toast 通知 | 底部彈出通知（success/error/info），3 秒自動消失 |
| 響應式設計 | 手機底部導覽列 / 桌面浮動底部 Dock |
| 建立功能入口 | FAB（浮動按鈕）點擊後選擇建立活動、社團或貼文 |
| 刪除確認 Modal | 所有破壞性操作（刪除社團、踢除成員、刪除貼文/留言）統一使用確認 Modal（禁用 `confirm()`），Modal 需包含操作說明與「確認刪除」/ 「取消」兩個按鈕 |

### 4.10 訊息系統（v1）

| 功能 | 行為說明 |
|------|----------|
| 對話列表 | 顯示所有對話，含對方頭像、名稱、最後一則訊息預覽、時間戳 |
| 發送訊息 | v1 僅支援純文字訊息，圖片傳送列為未來版本 |
| 訊息輪詢 | 每 5 秒輪詢一次最新訊息（Polling），不使用 WebSocket |
| 已讀回執 | 列為未來版本，v1 不實作 |
| 訊息歷史 | 進入對話頁面時載入歷史訊息，支援向上滾動載入更多 |

---

## 5. API 端點列表

> Base URL：`http://localhost:3000/v1`  
> 認證方式：Bearer Token（`Authorization: Bearer <accessToken>`）

### 錯誤回應格式

所有 API 發生錯誤時，回應格式統一為：

```json
{
  "code": "ERROR_CODE",
  "message": "人類可讀的錯誤說明"
}
```

| HTTP 狀態碼 | 說明 |
|-------------|------|
| `400` | 請求參數驗證失敗（Zod 錯誤） |
| `401` | 未認證或 Token 已過期 |
| `403` | 無權限執行此操作 |
| `404` | 資源不存在 |
| `409` | 衝突（如：已報名、已加入） |
| `500` | 伺服器內部錯誤 |

### 5.1 認證（/auth）

| Method | 路徑 | 功能 | Request Body | Response |
|--------|------|------|--------------|----------|
| POST | `/auth/login` | 登入 | `{email, password}` | `{user, accessToken, refreshToken}` |
| POST | `/auth/register` | 註冊 | `{name, email, password, phone?}` | `{user, accessToken, refreshToken}` |
| POST | `/auth/logout` | 登出 | — | `204 No Content` |
| POST | `/auth/refresh` | 更新 Token | `{refreshToken}` | `{accessToken}` |

### 5.2 使用者（/users）

| Method | 路徑 | 功能 | Request Body | Response |
|--------|------|------|--------------|----------|
| GET | `/users/me` | 取得目前使用者資料 | — | `User` |
| PATCH | `/users/me` | 更新個人資料 | `{name?, bio?, phone?}` | `User` |
| GET | `/users/me/explore-tags` | 取得探索標籤設定 | — | `ExploreTag[]` |
| PUT | `/users/me/explore-tags` | 儲存探索標籤設定 | `{tags: ExploreTag[]}` | `void` |

### 5.3 活動（/activities）

| Method | 路徑 | 功能 | Query / Body | Response |
|--------|------|------|--------------|----------|
| GET | `/activities` | 取得活動列表 | `limit` `search` `cities`（逗號分隔）`date`（YYYY-MM-DD）`minPrice` `maxPrice` `levels`（逗號分隔）`isNearlyFull`（boolean）`tags`（逗號分隔） | `{data: Activity[], pagination: {total}}` |
| GET | `/activities/:id` | 取得活動詳情 | — | `Activity & {isRegistered: boolean}` |
| POST | `/activities` | 建立活動 | `{title, date, time, location, price, mode, level, maxParticipants?, groups?, description, tags, image?}` | `Activity` |
| DELETE | `/activities/:id` | 刪除活動 | — | `204` |
| POST | `/activities/:id/register` | 報名活動 | `{group?: string, transportMode?: string, realName, phone, emergencyContact, emergencyPhone}` | `void` |
| DELETE | `/activities/:id/register` | 取消報名 | — | `void` |
| GET | `/activities/:id/participants` | 取得報名者列表（管理員） | — | `[{id, userId, name, avatar, group?, registeredAt}]` |

### 5.4 社團（/clubs）

| Method | 路徑 | 功能 | Query / Body | Response |
|--------|------|------|--------------|----------|
| GET | `/clubs` | 取得社團列表 | `limit` | `{data: Club[], pagination: {total}}` |
| GET | `/clubs/:id` | 取得社團詳情 | — | `Club & {isJoined, isAdmin}` |
| POST | `/clubs` | 建立社團 | `{name, description, tags, city?, logo?}` | `Club & {isAdmin: true}` |
| PATCH | `/clubs/:id` | 更新社團資料（管理員） | `{name?, description?, tags?, city?, logo?}` | `Club` |
| POST | `/clubs/:id/join` | 加入社團 | — | `{membersCount: number}` |
| DELETE | `/clubs/:id/join` | 退出社團 | — | `{membersCount: number}` |
| GET | `/clubs/:id/activities` | 取得社團活動列表 | — | `{data: Activity[]}` |
| GET | `/clubs/:id/members` | 取得成員列表（管理員） | — | `{data: ClubMember[]}` |
| DELETE | `/clubs/:id/members/:memberId` | 移除成員（管理員） | — | `204` |

### 5.5 貼文（/clubs/:clubId/posts）

| Method | 路徑 | 功能 | Query / Body | Response |
|--------|------|------|--------------|----------|
| GET | `/clubs/:clubId/posts` | 取得貼文列表 | `limit, type?, sort?` | `{data: Post[], pagination}` |
| POST | `/clubs/:clubId/posts` | 新增貼文 | `{type, content, images?}` | `Post & {isLiked: false}` |
| PATCH | `/clubs/:clubId/posts/:postId` | 編輯貼文（作者/管理員） | `{content}` | `Post` |
| DELETE | `/clubs/:clubId/posts/:postId` | 刪除貼文（管理員） | — | `204` |
| POST | `/clubs/:clubId/posts/:postId/like` | 按讚/取消按讚 | — | `{isLiked: boolean, likes: number}` |

### 5.6 留言（/clubs/:clubId/posts/:postId/comments）

| Method | 路徑 | 功能 | Body | Response |
|--------|------|------|------|----------|
| GET | `.../comments` | 取得留言列表 | — | `{data: CommentItem[]}` |
| POST | `.../comments` | 新增留言 | `{content, parentId?}` | `CommentItem` |
| DELETE | `.../comments/:commentId` | 刪除留言（管理員） | — | `204` |

### 5.7 通知（/notifications）

| Method | 路徑 | 功能 | Body | Response |
|--------|------|------|------|----------|
| GET | `/notifications` | 取得通知列表 | — | `{data: Notification[], unreadCount}` |
| PATCH | `/notifications/:id/read` | 標記單則已讀 | — | `void` |
| PATCH | `/notifications/read-all` | 全部標為已讀 | — | `void` |

### 5.8 訊息（/messages）

| Method | 路徑 | 功能 | Query / Body | Response |
|--------|------|------|--------------|----------|
| GET | `/messages` | 取得對話列表 | — | `{data: Conversation[]}` |
| GET | `/messages/:id` | 取得對話訊息（含歷史） | `before?`（cursor，ISO 時間）`limit?` | `{data: Message[], hasMore: boolean}` |
| POST | `/messages/:id` | 發送純文字訊息 | `{content: string}` | `Message` |

**Conversation 欄位：** `id, participant: {id, name, avatar}, lastMessage: {content, createdAt}, unreadCount`  
**Message 欄位：** `id, conversationId, senderId, content, createdAt`

### 5.9 檔案上傳

| Method | 路徑 | 功能 | Body | Response | 限制 |
|--------|------|------|------|----------|------|
| POST | `/upload` | 上傳圖片（multipart/form-data） | `file` | `{url: string}` | 最大 **10 MB**，格式：**JPG / PNG / WebP** |

> 前端送出前須驗證：檔案大小 ≤ 10MB，且 MIME type 屬於 `image/jpeg`、`image/png`、`image/webp`，否則顯示 error Toast 並中止上傳。

---

## 6. 頁面與路由清單

| 路由 | 頁面元件 | 用途說明 |
|------|----------|----------|
| `/` | `HomePage` | 首頁：搜尋列、探索標籤、精選社團、精選活動 |
| `/activities` | `ActivityListPage` | 活動列表頁：搜尋、進階篩選、清單/地圖切換、無限滾動 |
| `/activities/:id` | `ActivityDetailPage` | 活動詳情頁：完整資訊、地圖、報名入口 |
| `/clubs` | `ClubListPage` | 社團列表頁：瀏覽所有社團 |
| `/clubs/:id` | `ClubProfilePage` | 社團主頁：動態/活動/相簿三頁籤、管理功能 |
| `/profile` | `UserProfilePage` | 個人頁面（需登入）：我的活動、我的社團、設定 |
| `/notifications` | `NotificationsPage` | 通知頁面（需登入）：全部通知列表、一鍵全讀 |
| `/messages` | `MessagesPage` | 訊息列表頁：對話清單（含 Layout） |
| `/messages/:id` | `ConversationPage` | 對話頁面（全螢幕，無 Layout）：個別對話內容 |

### Layout 說明

- **有 Layout 的頁面**（`/` ～ `/messages`）：包含頂部 Navbar、底部導覽列（手機）或浮動 Dock（桌面），以及所有 Modal 掛載點
- **無 Layout 的頁面**（`/messages/:id`）：全螢幕，自行處理導覽

### 底部導覽項目

| 位置 | 圖示 | 標籤 | 連結 |
|------|------|------|------|
| 左 1 | 🏠 | 首頁 | `/` |
| 左 2 | 🔍 | 探索活動 | `/activities` |
| 中央 | ➕ | 建立 | 開啟 CreateMenuModal |
| 右 1 | 👥 | 探索社團 | `/clubs` |
| 右 2 | 💬 | 訊息 | `/messages` |

---

## 7. 待確認／未完成項目

### 7.1 後端未整合項目

| 項目 | 說明 | 影響 |
|------|------|------|
| 探索標籤同步 | `apiSaveExploreTags` 在網路失敗時只顯示錯誤 Toast，不回滾本地狀態 | 使用者可能看到儲存成功但後端未更新的狀態 |
| 報名欄位對應 | RegistrationModal 送出欄位已確認：`group?, transportMode?, realName, phone, emergencyContact, emergencyPhone`，需確認後端 Prisma schema 欄位命名一致 | 可能送出欄位名稱不符 |
| 報名者列表 UI | `GET /activities/:id/participants` 端點已定義，但 ClubProfile 管理員視圖尚未實作報名者列表 UI | 管理員無法在社團頁面查看與管理報名 |

### 7.2 功能不完整項目

| 項目 | 說明 |
|------|------|
| 訊息系統後端 | 前端 Polling（每 5 秒）與 v1 純文字規格已確認，後端 `/messages` 路由尚需實作；已讀回執列為未來版本 |
| 相簿頁籤 | ClubProfile「相簿」頁籤有 UI 架構，但圖片上傳、排列與刪除邏輯尚未完整實作 |
| 語言切換 | SettingsModal 有語言選項但為佔位（placeholder），尚未實作多語系 |
| 系統管理員角色 | types.ts 與後端均無系統管理員角色設計，未來若需後台須另行擴充 |
| 社團邀請流程 | INVITE 通知類型已定義，但主動邀請成員的 UI 流程（邀請表單、API 端點）尚未實作 |
| 活動評分 | Club 有 `rating` 欄位，但使用者評分活動的 UI 與 API 均未實作 |
| 搜尋防抖（HomePage） | ActivityListPage 有 350ms debounce，但 HomePage 搜尋列無防抖，可能觸發過多 navigate |

### 7.3 安全性與驗證缺口

| 項目 | 說明 |
|------|------|
| 前端登入守衛 | `UserProfilePage` 與 `NotificationsPage` 有登入守衛，但 `ClubProfilePage` 發文、`ActivityDetailPage` 報名目前透過 `requireAuth()` 處理，若使用者直接訪問 URL 可能短暫看到未授權內容 |

> **已解決：**  
> - ~~圖片上傳驗證~~ → 已確認前端驗證規則（10MB、JPG/PNG/WebP），見第 8 章  
> - ~~刪除確認~~ → 已確認統一使用確認 Modal（見 §4.9）

### 7.4 體驗缺口

| 項目 | 說明 |
|------|------|
| 空狀態設計 | 搜尋無結果、沒有通知等空狀態 UI 尚未確認是否有對應設計稿 |
| 無限滾動 vs Load More | ActivityListPage 使用手動 Load More 按鈕，非自動滾動觸發，與行業慣例有差異 |
| 圖片 Lazy Loading | 活動/社團列表圖片未使用 `loading="lazy"` 或 IntersectionObserver，首次載入可能效能較差 |

> **已解決：**  
> - ~~篩選條件持久化~~ → 已確認同步至 URL query string（見第 8 章）

### 7.5 程式碼中的 TODO 標記

> 執行 `grep -r "TODO\|FIXME\|HACK\|XXX" src/` 可找出所有標記，主要集中於：

- `ExploreTagManagerModal.tsx`：拖曳排序存檔後的後端同步邏輯
- `services/api.ts`：部分 data mapper 欄位映射未完整（如 `bio`、`phone` 回應格式）
- `ClubProfile.tsx`：相簿功能佔位實作

---

---

## 8. 設計決策紀錄

> 記錄已明確拍板的設計決定，供開發時依循。

### 8.1 決策摘要

| # | 項目 | 決定 | 說明 |
|---|------|------|------|
| 1 | 訊息即時通訊 | **Polling，每 5 秒** | v1 不使用 WebSocket，降低後端複雜度 |
| 2 | 訊息圖片 | **v1 純文字，圖片列未來版本** | 避免 v1 過度複雜 |
| 3 | 已讀回執 | **未來版本** | v1 不實作 |
| 4 | 刪除確認 | **所有刪除操作需確認 Modal** | 禁用 `confirm()`，統一使用自訂 ConfirmModal |
| 5 | 篩選條件持久化 | **同步至 URL query string** | 支援瀏覽器上一頁與分享連結 |
| 6 | URL 篩選參數名稱 | 見下方 §8.2 | — |
| 7 | API 錯誤格式 | **`{code, message}`** | 見 §5 錯誤格式說明 |
| 8 | 圖片上傳限制 | **10MB，JPG / PNG / WebP** | 前後端均驗證 |
| 9 | 圖片儲存 | **v1 本地 `uploads/`，未來遷移雲端** | 不影響前端 API 介面 |
| 10 | 活動建立表單驗證 | 見下方 §8.3 | — |

---

### 8.2 活動列表 URL Query String 規格

`/activities` 頁面的篩選條件須同步至 URL，格式如下：

```
/activities?search=羽球&cities=台北市,新北市&date=2026-05-01&minPrice=0&maxPrice=500&levels=BEGINNER,INTERMEDIATE&isNearlyFull=true
```

| 參數名 | 型別 | 說明 | 範例 |
|--------|------|------|------|
| `search` | string | 關鍵字搜尋 | `羽球` |
| `cities` | string（逗號分隔） | 縣市篩選 | `台北市,新北市` |
| `date` | string（YYYY-MM-DD） | 日期篩選 | `2026-05-01` |
| `minPrice` | number | 最低費用 | `0` |
| `maxPrice` | number | 最高費用 | `500` |
| `levels` | string（逗號分隔） | 難度篩選 | `BEGINNER,INTERMEDIATE` |
| `isNearlyFull` | boolean string | 快額滿篩選 | `true` |

**實作要點：**
- 使用 `useSearchParams()` 讀寫 URL 參數
- 進入頁面時優先從 URL 還原篩選條件，再初始化 Context 狀態
- 每次使用者更改篩選條件時立即更新 URL（`replace: true`，不產生歷史紀錄堆疊）

---

### 8.3 活動建立表單驗證規則

| 欄位 | 驗證規則 |
|------|----------|
| `title` | 必填，2–50 字元 |
| `date` | 必填，必須為今天以後的日期（YYYY-MM-DD） |
| `time` | 必填，格式 HH:MM |
| `location` | 必填，2–100 字元 |
| `price` | 必填，整數，≥ 0 |
| `level` | 必填，從 `BEGINNER / INTERMEDIATE / ADVANCED / PRO` 選一 |
| `mode` | 必填，從 `LIMITED / OPEN` 選一 |
| `maxParticipants` | LIMITED 模式必填，整數，≥ 1；OPEN 模式忽略 |
| `groups` | OPEN 模式必填，至少 1 個組別名稱；LIMITED 模式忽略 |
| `description` | 必填，10–2000 字元 |
| `tags` | 選填，最多 10 個，每個標籤 ≤ 20 字元 |
| `image` | 選填，若上傳：≤ 10MB，JPG / PNG / WebP |

**錯誤顯示方式：**
- 表單欄位下方顯示紅色錯誤文字
- 送出時若有任何驗證錯誤，滾動至第一個錯誤欄位並顯示 error Toast

---

*此規格書由程式碼自動分析產出，如有異動請同步更新本文件。*
