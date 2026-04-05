# API 端點

> Base URL：`http://localhost:3000/v1`
> 認證：`Authorization: Bearer <accessToken>`

## 錯誤格式

```json
{ "code": "ERROR_CODE", "message": "說明" }
```

| 狀態碼 | 說明 |
|--------|------|
| 400 | 參數驗證失敗 |
| 401 | 未認證或 Token 過期 |
| 403 | 無權限 |
| 404 | 資源不存在 |
| 409 | 衝突（已報名、已加入） |
| 500 | 伺服器錯誤 |

---

## 5.1 認證（/auth）

| Method | 路徑 | 功能 | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/login` | 登入 | `{email, password}` | `{user, accessToken, refreshToken}` |
| POST | `/auth/register` | 註冊 | `{name, email, password, phone?}` | `{user, accessToken, refreshToken}` |
| POST | `/auth/logout` | 登出 | — | `204` |
| POST | `/auth/refresh` | 更新 Token | `{refreshToken}` | `{accessToken}` |

## 5.2 使用者（/users）

| Method | 路徑 | 功能 | Body | Response |
|--------|------|------|------|----------|
| GET | `/users/me` | 取得使用者 | — | `User` |
| PATCH | `/users/me` | 更新資料 | `{name?, bio?, phone?}` | `User` |
| GET | `/users/me/explore-tags` | 取得探索標籤 | — | `ExploreTag[]` |
| PUT | `/users/me/explore-tags` | 儲存探索標籤 | `{tags: ExploreTag[]}` | `void` |

## 5.3 活動（/activities）

| Method | 路徑 | 功能 | Query/Body | Response |
|--------|------|------|------------|----------|
| GET | `/activities` | 列表 | `limit, search, cities, date, minPrice, maxPrice, levels, isNearlyFull, tags` | `{data: Activity[], pagination: {total}}` |
| GET | `/activities/:id` | 詳情 | — | `Activity & {isRegistered}` |
| POST | `/activities` | 建立 | `{title, date, time, location, price, mode, level, maxParticipants?, groups?, description, tags, image?}` | `Activity` |
| DELETE | `/activities/:id` | 刪除 | — | `204` |
| POST | `/activities/:id/register` | 報名 | `{group?, transportMode?, realName, phone, emergencyContact, emergencyPhone}` | `void` |
| DELETE | `/activities/:id/register` | 取消報名 | — | `void` |
| GET | `/activities/:id/participants` | 報名者（管理員） | — | `[{id, userId, name, avatar, group?, registeredAt}]` |

## 5.4 社團（/clubs）

| Method | 路徑 | 功能 | Query/Body | Response |
|--------|------|------|------------|----------|
| GET | `/clubs` | 列表 | `limit` | `{data: Club[], pagination: {total}}` |
| GET | `/clubs/:id` | 詳情 | — | `Club & {isJoined, isAdmin}` |
| POST | `/clubs` | 建立 | `{name, description, tags, city?, logo?}` | `Club & {isAdmin: true}` |
| PATCH | `/clubs/:id` | 更新（管理員） | `{name?, description?, tags?, city?, logo?}` | `Club` |
| POST | `/clubs/:id/join` | 加入 | — | `{membersCount}` |
| DELETE | `/clubs/:id/join` | 退出 | — | `{membersCount}` |
| GET | `/clubs/:id/activities` | 社團活動 | — | `{data: Activity[]}` |
| GET | `/clubs/:id/members` | 成員列表（管理員） | — | `{data: ClubMember[]}` |
| DELETE | `/clubs/:id/members/:memberId` | 移除成員 | — | `204` |

## 5.5 貼文（/clubs/:clubId/posts）

| Method | 路徑 | 功能 | Body | Response |
|--------|------|------|------|----------|
| GET | `.../posts` | 列表 | `limit, type?, sort?` | `{data: Post[], pagination}` |
| POST | `.../posts` | 新增 | `{type, content, images?}` | `Post & {isLiked: false}` |
| PATCH | `.../posts/:postId` | 編輯 | `{content}` | `Post` |
| DELETE | `.../posts/:postId` | 刪除 | — | `204` |
| POST | `.../posts/:postId/like` | 按讚/取消 | — | `{isLiked, likes}` |

## 5.6 留言（/clubs/:clubId/posts/:postId/comments）

| Method | 路徑 | 功能 | Body | Response |
|--------|------|------|------|----------|
| GET | `.../comments` | 列表 | — | `{data: CommentItem[]}` |
| POST | `.../comments` | 新增 | `{content, parentId?}` | `CommentItem` |
| DELETE | `.../comments/:commentId` | 刪除 | — | `204` |

## 5.7 通知（/notifications）

| Method | 路徑 | 功能 | Response |
|--------|------|------|----------|
| GET | `/notifications` | 列表 | `{data: Notification[], unreadCount}` |
| PATCH | `/notifications/:id/read` | 標記已讀 | `void` |
| PATCH | `/notifications/read-all` | 全部已讀 | `void` |

## 5.8 訊息（/messages）

| Method | 路徑 | 功能 | Query/Body | Response |
|--------|------|------|------------|----------|
| GET | `/messages` | 對話列表 | — | `{data: Conversation[]}` |
| GET | `/messages/:id` | 訊息歷史 | `before?(ISO), limit?` | `{data: Message[], hasMore}` |
| POST | `/messages/:id` | 發送訊息 | `{content}` | `Message` |

**Conversation：** `id, participant: {id, name, avatar}, lastMessage: {content, createdAt}, unreadCount`
**Message：** `id, conversationId, senderId, content, createdAt`

## 5.9 檔案上傳

| Method | 路徑 | Body | Response | 限制 |
|--------|------|------|----------|------|
| POST | `/upload` | `file`（multipart） | `{url}` | ≤10MB，JPG/PNG/WebP |

前端送出前須驗證檔案大小與 MIME type，否則顯示 error Toast 並中止。
