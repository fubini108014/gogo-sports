# GoGo Sports — 交接文件

> 最後更新：2026-04-20（新增地圖標記聚合）

---

## 專案現況

**Stack：** React 19 + TypeScript + Vite + Tailwind CSS / Fastify + Prisma + PostgreSQL (Docker)

**啟動方式：**
```bash
docker start gogosports-db          # 啟動 DB
cd backend && npx prisma migrate deploy   # 套用新 migration（首次/DB 重建後）
cd backend && npm run dev            # 後端 :3000
npm run dev                          # 前端 :5173
```

測試帳號：`alex@example.com` / `password123`

---

## 路由總覽

| 路徑 | 元件 | 備註 |
|------|------|------|
| `/` | HomePage | 搜尋列 + 探索標籤 + 推薦社團/活動 |
| `/activities` | ActivityListPage | 列表/地圖切換，日曆篩選，500ms debounce 搜尋，**Autocomplete 下拉** |
| `/activities/:id` | ActivityDetailPage | 詳情 + Leaflet 地圖，**骨架屏** |
| `/clubs` | ClubListPage | IntersectionObserver 無限滾動 |
| `/clubs/:id` | ClubProfilePage | 社群/活動/**相簿（真實上傳）** 頁籤 |
| `/profile` | UserProfilePage | 個人資料、報名記錄、加入社團，**骨架屏 + LockedPage** |
| `/notifications` | NotificationsPage | 通知列表，一鍵全讀，**骨架屏 + LockedPage** |
| `/messages` | MessagesPage | 對話列表，10s polling，**LockedPage** |
| `/messages/:id` | ConversationPage | 對話詳情（无 Layout），5s polling，**LockedPage** |
| `/join/:token` | JoinByTokenPage | 社團邀請連結入口（无 Layout wrapper） |

---

## 已完成功能

### 認證
- JWT access token (15min) + refresh token (30d)，存於 localStorage
- App 啟動時自動呼叫 `/users/me` 還原登入狀態
- 401 自動換 token，最多重試一次
- `requireAuth()` — 未登入時開啟 Auth Modal 而不是跳轉

### 活動模組
- 列表：關鍵字搜尋（500ms debounce）、城市/程度/價格/快額滿篩選、日曆選日期（週/月切換）
- **搜尋建議 Autocomplete**：`GET /activities/suggestions?q=` 回傳活動名稱/地點/標籤建議，前端 200ms debounce 觸發，onBlur 收起
- 地圖：react-leaflet + `leaflet.markercluster`，橘色標記，重疊自動聚合（橘色數字圓，點擊展開），`fitBounds`，popup 可直接進入詳情
- 詳情：**骨架屏**（取代 spinner）；大圖、主揪信任卡（稱號/帶團次數）、LIMITED 進度條 / OPEN 頭像列
- 建立：支援 LIMITED / OPEN 模式，approvalMode AUTO / MANUAL
- 報名流程：Step1 組別/交通 → Step2 聯絡資訊 + 隱私聲明
- **報名者列表**：主揪可在活動詳情頁查看所有報名者（`ParticipantsPanel`），顯示狀態、聯絡資訊，支援審核操作
- 主揪審核：批准/拒絕/移入候補，批准後才扣名額
- 自動遞補：有人取消時最早 WAITLISTED 自動升為 APPROVED 並送通知
- 標記缺席：活動結束後主揪可標記，觸發 XP 懲罰
- **活動評分**：活動結束後，APPROVED / ABSENT 參與者可評 1–5 星；`RatingPanel` 元件、`POST /activities/:id/rate`、`GET /activities/:id/my-rating`；自動更新 `Club.rating` 平均值

### 社團模組
- 列表：關鍵字/分類/排序，IntersectionObserver 無限滾動
- 社團頁：社群 Feed、活動月曆（週/月/年）、**相簿 tab（真實圖片 + 管理員上傳 + Lightbox）**
- 加入/退出：即時更新 membersCount + Toast
- 社團管理 Modal（管理員）：編輯資訊 / 成員管理（踢除）/ **邀請連結**
  - 邀請連結：7 天有效，一鍵複製 `/join/:token`
  - `/join/:token`：未登入先開 Auth Modal，登入後自動加入並跳轉至社團頁

### 社群互動
- 貼文：公告/閒聊/相簿，篩選類型，最新/最早排序
- 留言：巢狀兩層（parentId），管理員可刪除任意留言
- 按讚：toggle，local state 即時更新
- 貼文編輯/刪除（管理員）

### 個人中心
- UserProfile：頭像、暱稱、報名活動、加入社團；**骨架屏**
- 取消報名 / 退出社團
- **設定 Modal** 新增「編輯個人檔案」子畫面：暱稱、手機、簡介 → `PATCH /users/me`

### 運動稱號 (XP)
- 各運動項目獨立 XP（sportXP JSON 欄位）
- 趣味稱號依等級顯示於個人頁 / 主揪卡 / 貼文作者旁
- 活動結束自動發放；主揪標記缺席則扣除

### 通知
- 列表，未讀深色背景，一鍵全讀；**骨架屏**
- 點擊跳轉：ACTIVITY → 活動詳情；INVITE/INTERACTION → 社團頁
- Nav 鈴鐺顯示未讀數紅點

### 訊息（完整前後端）
- **Prisma 模型**：`Conversation`、`ConversationParticipant`、`Message`（支援 replyTo 自關聯）
- **Migration**：`20260414000000_add_messaging`
- **後端路由** `GET /messages`（對話列表 + 未讀數）、`POST /messages`（建立/找回 DM）、`GET /messages/:id`（分頁訊息 + 標記已讀）、`POST /messages/:id`（發送訊息）
- `GET /users?search=` 供新對話搜尋使用者
- **前端 MessagesPage**：真實 API、骨架屏、10s polling、新對話搜尋
- **前端 ConversationPage**：樂觀送出（Optimistic update）、5s polling、回覆預覽、載入更多（cursor-based）

### 路由原地攔截
- **`LockedPage` 元件** (`components/ui/LockedPage.tsx`)：橘色鎖頭插圖 + 標題/說明 + 登入按鈕
- 套用於：`/profile`、`/notifications`、`/messages`、`/messages/:id`
- 未登入時原地顯示 LockedPage，不跳轉、不開 Modal

### 系統
- Dark Mode：Tailwind `dark:` class，localStorage 持久化
- Toast：底部彈出（success/error/info），3 秒消失
- Skeleton：ActivityList、ClubList、ActivityDetail（`ActivityDetailPage.tsx`）、NotificationList（`NotificationList.tsx`）、UserProfile
- IntersectionObserver 無限滾動：ActivityList、ClubList
- 搜尋防抖：ActivityListPage 500ms（打字自動觸發），Enter/按鈕立即觸發
- 圖片 `loading="lazy"`：全站

---

## 後端 API 速查

> 所有路由前綴 `/v1`，需要登入的路由以 🔐 標示

### 認證 `/v1/auth`
| Method | 路徑 | 說明 |
|--------|------|------|
| POST | `/register` | 註冊（name, email, password） |
| POST | `/login` | 登入，回傳 accessToken + refreshToken |
| POST | `/refresh` | 換發 accessToken（body: { refreshToken }） |
| POST | `/logout` | 🔐 登出，撤銷 refreshToken |

### 使用者 `/v1/users`
| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/?search=` | 搜尋使用者（新對話用，回傳 id/name/avatar） |
| GET | `/me` | 🔐 取得當前登入者資料 |
| PATCH | `/me` | 🔐 更新個人資料（name, phone, bio） |

### 活動 `/v1/activities`
| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/` | 活動列表（支援 q/city/level/minPrice/maxPrice/almostFull/date 篩選） |
| GET | `/suggestions?q=` | Autocomplete，回傳 `{ type: 'title'\|'location'\|'tag', value }[]`，最多 8 筆 |
| GET | `/:id` | 活動詳情 |
| POST | `/` | 🔐 建立活動 |
| PATCH | `/:id` | 🔐 更新活動（主揪） |
| GET | `/:id/participants` | 🔐 報名者列表（主揪） |
| POST | `/:id/register` | 🔐 報名活動 |
| DELETE | `/:id/register` | 🔐 取消報名 |
| PATCH | `/:id/registrations/:regId` | 🔐 審核報名（status: APPROVED/REJECTED/WAITLISTED） |
| PATCH | `/:id/registrations/:regId/absent` | 🔐 標記缺席（觸發 XP 懲罰） |

### 社團 `/v1/clubs`
| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/` | 社團列表（q/category/sort/cursor 無限滾動） |
| GET | `/:id` | 社團詳情 |
| POST | `/` | 🔐 建立社團 |
| PATCH | `/:id` | 🔐 更新社團（管理員） |
| POST | `/:id/join` | 🔐 加入社團 |
| DELETE | `/:id/leave` | 🔐 退出社團 |
| DELETE | `/:id/members/:userId` | 🔐 踢除成員（管理員） |
| POST | `/:id/invite-links` | 🔐 建立邀請連結（7 天有效） |
| POST | `/join/:token` | 🔐 透過 token 加入社團 |

### 貼文 `/v1/clubs`（同前綴）
| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/:id/posts` | 取得社團貼文（type/sort 篩選） |
| POST | `/:id/posts` | 🔐 發佈貼文（type: ANNOUNCEMENT/DISCUSSION/PHOTO, images[]） |
| PATCH | `/:id/posts/:postId` | 🔐 編輯貼文（管理員） |
| DELETE | `/:id/posts/:postId` | 🔐 刪除貼文（管理員） |
| POST | `/:id/posts/:postId/like` | 🔐 按讚 / 取消讚（toggle） |
| GET | `/:id/posts/:postId/comments` | 取得留言 |
| POST | `/:id/posts/:postId/comments` | 🔐 新增留言（body: content, parentId?） |
| DELETE | `/:id/posts/:postId/comments/:commentId` | 🔐 刪除留言（管理員） |

### 通知 `/v1/notifications`
| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/` | 🔐 通知列表 |
| PATCH | `/read-all` | 🔐 全部標為已讀 |

### 訊息 `/v1/messages`
| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/` | 🔐 對話列表（含未讀數、最後一則訊息） |
| POST | `/` | 🔐 建立/找回 DM（participantIds[], isGroup?, name?, firstMessage?） |
| GET | `/:id` | 🔐 訊息列表（cursor-based: ?before=ISO&limit=30），自動標記已讀 |
| POST | `/:id` | 🔐 發送訊息（content, replyToId?） |

### 上傳 `/v1/upload`
| Method | 路徑 | 說明 |
|--------|------|------|
| POST | `/` | 🔐 multipart/form-data，field 名稱 `file`，回傳 `{ url }` |

> **本地模式**：檔案存於 `backend/uploads/`，URL 為 `/uploads/filename`。
> **生產模式**：設定 `.env` 的 R2 變數後自動改用 Cloudflare R2。

---

## 環境設定

### 後端 `.env`（複製 `backend/.env.example`）

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/gogosports"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5173"

# 可選：Cloudflare R2 圖片上傳（不填則存本地 uploads/）
# R2_ACCOUNT_ID=""
# R2_ACCESS_KEY_ID=""
# R2_SECRET_ACCESS_KEY=""
# R2_BUCKET_NAME=""
# R2_PUBLIC_URL=""
```

### Docker DB 初始化（首次 / 重建）

```bash
# 建立並啟動 PostgreSQL 容器
docker run -d \
  --name gogosports-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=gogosports \
  -p 5432:5432 \
  postgres:16

# 套用所有 migration
cd backend && npx prisma migrate deploy

# （可選）建立種子資料
cd backend && npx prisma db seed
```

### 日常啟動

```bash
docker start gogosports-db
cd backend && npm run dev    # :3000
npm run dev                  # :5173
```

---

## Prisma Schema 重點

> `backend/prisma/schema.prisma`

- `RegistrationStatus`：`PENDING | APPROVED | REJECTED | WAITLISTED | CANCELLED | ABSENT`
- `ApprovalMode`：`AUTO | MANUAL`
- `ClubInviteLink`：token（唯一）、expiresAt、requireApproval
- `Conversation` / `ConversationParticipant` / `Message`：私訊系統
  - Message.replyToId 自關聯（`onDelete: NoAction`）
- 所有 Migration：
  - `20260306173924_init`
  - `20260307000000_add_comment_parent`
  - `20260408000000_add_club_invite_links`
  - `20260414000000_add_messaging`

---

## 關鍵元件說明

### `LockedPage` (`components/ui/LockedPage.tsx`)
未登入時的原地攔截元件，替代跳轉行為。Props：

```tsx
<LockedPage
  title="需要登入"          // 選填，預設「需要登入」
  description="請登入後繼續" // 選填
/>
```

內部呼叫 `setIsAuthModalOpen(true)` 開啟登入 Modal。目前套用於：
- `UserProfilePage`、`NotificationsPage`、`MessagesPage`、`ConversationPage`

### `ActivitySuggestion` 型別（`services/api.ts`）

```ts
interface ActivitySuggestion {
  type: 'title' | 'location' | 'tag'
  value: string
}
```

前端 200ms debounce 呼叫 `GET /v1/activities/suggestions?q=`，`onBlur` 後 150ms 收起（避免 `mousedown` 競爭）。

### 相簿上傳流程（`ClubProfile.tsx`）

1. 管理員點擊「上傳照片」→ `<input type="file" accept="image/*">` 觸發
2. `apiUploadFile(file)` → `POST /v1/upload` → 回傳 URL
3. `apiCreatePost(clubId, 'PHOTO', '', [url])` 建立 PHOTO 類型貼文
4. 重新拉取貼文列表刷新相簿 grid
5. Lightbox 點擊放大（`lightboxUrl` state 控制）

### Optimistic Update（`ConversationPage.tsx`）

送出訊息時先在本地插入 temp message（`id: 'temp-...'`），API 成功後以真實資料替換。若 API 失敗，移除 temp message 並顯示 Toast。

---

## 待辦清單（Backlog）

| 項目 | 說明 | 優先 |
|------|------|------|
| 探索標籤後端路由 | `GET /users/me/explore-tags` 後端路由不存在（`services/api.ts` 有 `// Backend endpoint may not exist yet` 備注）；`saveExploreTags` 目前只存 localStorage，偏好無法跨裝置同步 | 低 |
| ~~地圖標記聚合~~ | ✅ 已完成：`leaflet.markercluster` 整合至 `ActivityMap.tsx`，橘色聚合圓 + 展開/spiderfy | 低 |
| 語言切換 | SettingsModal 無語言選項，i18n 完全未實作 | 低 |

---

## 關鍵檔案速查

| 檔案 | 用途 |
|------|------|
| `context/AppContext.tsx` | 所有全域狀態 + handlers（登入/登出/報名/社團/通知）；`notificationsLoading` 狀態 |
| `services/api.ts` | 所有 API 呼叫，mapper 函式，包含 messages / suggestions 新函式 |
| `types.ts` | 所有 TS 介面（User 有 bio?, phone?）|
| `components/ui/LockedPage.tsx` | 未登入攔截插圖元件 |
| `components/modals/ModalManager.tsx` | 所有 Modal 的統一掛載點（符合 CLAUDE.md 規範） |
| `backend/src/routes/messages.ts` | 訊息後端路由（Conversation / Message） |
| `backend/src/routes/activities.ts` | 包含 `GET /suggestions` autocomplete endpoint |
| `backend/src/routes/` | clubs.ts / activities.ts / users.ts / auth.ts / posts.ts / messages.ts |
| `backend/prisma/schema.prisma` | 完整 DB schema |

---

## 開發注意事項

### Modal 必須掛在 `ModalManager.tsx`
所有新 Modal 元件一律在 `components/modals/ModalManager.tsx` 掛載，不在 Page 或子元件內宣告（見 CLAUDE.md §1）。

### 新增全域狀態 → AppContext
跨頁面/元件共用的資料和 handler 放 `context/AppContext.tsx`；子元件只能讀取或呼叫 context 提供的 handler，不直接呼叫 API 或 mutate。

### 新增路由 → App.tsx
`pages/` 下新增 Page 元件後，記得在 `App.tsx` 的 `<Routes>` 補 `<Route>`。

### 背景 Polling 記得 cleanup
MessagesPage（10s）和 ConversationPage（5s）使用 `setInterval` + `useEffect` cleanup，新增 polling 頁面需照相同 pattern 避免 memory leak。

### Prisma Migration 流程
```bash
# 本地開發新增欄位：
cd backend && npx prisma migrate dev --name your_migration_name

# 部署到既有 DB（不重建）：
cd backend && npx prisma migrate deploy
```

### 圖片上傳模式切換
`.env` 沒有 `R2_*` 變數 → 存 `backend/uploads/`（URL = `/uploads/xxx`）。
有 `R2_*` 變數 → 存 Cloudflare R2（URL = `R2_PUBLIC_URL/xxx`）。
前端一律存 URL 字串，無需感知後端模式。

### Rate Limit
後端設定 100 req/min per IP（`@fastify/rate-limit`）。開發時如需壓測，暫時調高或關閉 plugin。
