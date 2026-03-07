# GoGo Sports Backend API Design

## Tech Stack

| 層 | 技術 |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | **Fastify** (高效能) 或 NestJS (結構嚴謹) |
| Database | **PostgreSQL** |
| ORM | **Prisma** |
| Auth | JWT (Access Token 15min + Refresh Token 30d) |
| Cache | Redis (熱門活動列表、Session) |
| Storage | Cloudflare R2 / AWS S3 (圖片上傳) |
| Deploy | Railway / Render / Fly.io |

---

## Base URL

```
https://api.gogosports.tw/v1
```

---

## 認證 (Auth)

所有需要登入的 API 在 Header 帶：
```
Authorization: Bearer <access_token>
```

### POST /auth/register
註冊新帳號

**Request Body:**
```json
{
  "name": "Alex Chen",
  "email": "alex@example.com",
  "password": "password123",
  "phone": "0912345678"
}
```

**Response 201:**
```json
{
  "user": { "id": "u1", "name": "Alex Chen", "email": "alex@example.com" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### POST /auth/login
```json
// Request
{ "email": "alex@example.com", "password": "password123" }

// Response 200
{ "user": {...}, "accessToken": "...", "refreshToken": "..." }
```

### POST /auth/refresh
```json
// Request
{ "refreshToken": "eyJ..." }

// Response 200
{ "accessToken": "eyJ..." }
```

### POST /auth/logout
```json
// Request (需登入)
{ "refreshToken": "eyJ..." }
// Response 204 No Content
```

### POST /auth/forgot-password
```json
// Request
{ "email": "alex@example.com" }
// Response 200: 發送重設密碼 Email
```

---

## 使用者 (Users)

### GET /users/me
取得目前登入者的完整資料

**Response 200:**
```json
{
  "id": "u1",
  "name": "Alex Chen",
  "email": "alex@example.com",
  "phone": "0912345678",
  "avatar": "https://...",
  "bio": "羽球愛好者",
  "isClubAdmin": true,
  "registeredActivityIds": ["a1", "a8"],
  "joinedClubIds": ["c1", "c2"],
  "managedClubIds": ["c1"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PATCH /users/me
更新個人資料

```json
// Request (只送要改的欄位)
{
  "name": "Alex Chen",
  "bio": "新手上路中",
  "avatar": "https://..."
}
```

### POST /users/me/avatar
上傳大頭照 (multipart/form-data)

```
Request: form-data { file: <image> }
Response 200: { "avatarUrl": "https://..." }
```

### GET /users/me/activities
取得我報名的活動列表

**Query Params:** `?status=upcoming|past&page=1&limit=10`

**Response 200:**
```json
{
  "data": [{ ...Activity }],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

### GET /users/me/clubs
取得我加入的社團列表

---

## 活動 (Activities)

### GET /activities
瀏覽活動列表（支援篩選 + 搜尋 + 分頁）

**Query Params:**
```
search=羽球          # 關鍵字搜尋 (title, location, tags)
cities=台北市,新北市  # 城市（逗號分隔，"全台灣" 表示不限）
date=2023-11-14      # 指定日期 (YYYY-MM-DD)
minPrice=0           # 最低費用
maxPrice=1000        # 最高費用
levels=新手友善,中階  # 程度（逗號分隔）
isNearlyFull=true    # 是否快額滿
mode=LIMITED|OPEN    # 報名模式
status=OPEN|FULL     # 活動狀態 (預設 OPEN)
tags=羽球,登山       # 標籤
sport=羽球           # 運動類型
clubId=c1            # 特定社團的活動
sortBy=date|price|participants  # 排序
sortOrder=asc|desc
page=1
limit=12
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "a1",
      "clubId": "c1",
      "club": { "id": "c1", "name": "台北羽球狂熱團", "logo": "https://..." },
      "title": "週二晚間歡樂羽球",
      "date": "2023-11-14",
      "time": "19:00 - 21:00",
      "location": "台北市大同運動中心",
      "city": "台北市",
      "price": 250,
      "mode": "LIMITED",
      "status": "OPEN",
      "maxParticipants": 16,
      "currentInternalCount": 4,
      "currentAppCount": 8,
      "level": "中階",
      "image": "https://...",
      "tags": ["羽球", "教練", "冷氣"],
      "lat": 25.0634,
      "lng": 121.5196,
      "isRegistered": false,
      "spotsLeft": 4
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 26, "totalPages": 3 }
}
```

### GET /activities/:id
取得單一活動詳情

**Response 200:**
```json
{
  "id": "a1",
  "club": { "id": "c1", "name": "台北羽球狂熱團", "logo": "...", "membersCount": 1205 },
  "title": "週二晚間歡樂羽球 (含教練指導)",
  "date": "2023-11-14",
  "time": "19:00 - 21:00",
  "location": "台北市大同運動中心",
  "city": "台北市",
  "price": 250,
  "mode": "LIMITED",
  "status": "OPEN",
  "maxParticipants": 16,
  "currentInternalCount": 4,
  "currentAppCount": 8,
  "groups": null,
  "level": "中階",
  "image": "https://...",
  "description": "本週二固定團練...",
  "tags": ["羽球", "教練", "冷氣"],
  "lat": 25.0634,
  "lng": 121.5196,
  "isRegistered": false,
  "spotsLeft": 4,
  "createdAt": "2023-11-01T00:00:00Z"
}
```

### POST /activities
建立新活動 (需為社團管理員)

**Request Body:**
```json
{
  "clubId": "c1",
  "title": "週二晚間歡樂羽球",
  "date": "2023-11-14",
  "time": "19:00 - 21:00",
  "location": "台北市大同運動中心",
  "city": "台北市",
  "price": 250,
  "mode": "LIMITED",
  "maxParticipants": 16,
  "groups": null,
  "level": "中階",
  "description": "本週二固定團練...",
  "tags": ["羽球", "教練"],
  "lat": 25.0634,
  "lng": 121.5196
}
```

**Response 201:** 回傳完整 Activity 物件

### PATCH /activities/:id
更新活動 (需為活動所屬社團管理員)

### DELETE /activities/:id
刪除 / 取消活動 (需為活動所屬社團管理員)
**Response 204 No Content**

### POST /activities/:id/image
上傳活動封面圖 (multipart/form-data)

---

## 活動報名 (Registrations)

### POST /activities/:id/register
報名活動

**Request Body (OPEN mode 需選組別):**
```json
{
  "group": "攻頂挑戰組"
}
```

**Response 201:**
```json
{
  "registrationId": "r_xyz",
  "activityId": "a1",
  "userId": "u1",
  "group": null,
  "status": "CONFIRMED",
  "registeredAt": "2023-11-10T12:00:00Z"
}
```

**Error Cases:**
- `400` 活動已額滿
- `409` 已報名過此活動
- `403` 活動未開放報名

### DELETE /activities/:id/register
取消報名

**Response 204 No Content**

### GET /activities/:id/participants
取得活動報名者列表 (需為社團管理員)

```json
{
  "total": 8,
  "data": [
    { "userId": "u1", "name": "Alex Chen", "avatar": "...", "group": null, "registeredAt": "..." }
  ]
}
```

---

## 社團 (Clubs)

### GET /clubs
瀏覽社團列表

**Query Params:**
```
search=羽球
tags=球類,戶外
city=台北市
sortBy=rating|membersCount
sortOrder=desc
page=1
limit=12
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "c1",
      "name": "台北羽球狂熱團",
      "logo": "https://...",
      "rating": 4.8,
      "membersCount": 1205,
      "description": "每週二四固定開團...",
      "tags": ["羽球", "室內", "競技"],
      "isJoined": false,
      "upcomingActivitiesCount": 3
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 16, "totalPages": 2 }
}
```

### GET /clubs/:id
取得社團詳情

**Response 200:**
```json
{
  "id": "c1",
  "name": "台北羽球狂熱團",
  "logo": "https://...",
  "coverImage": "https://...",
  "rating": 4.8,
  "membersCount": 1205,
  "description": "每週二四固定開團...",
  "tags": ["羽球", "室內", "競技"],
  "isJoined": true,
  "isAdmin": true,
  "adminIds": ["u1"],
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### POST /clubs
建立社團

```json
{
  "name": "台北羽球狂熱團",
  "description": "每週二四固定開團...",
  "tags": ["羽球", "室內"],
  "city": "台北市"
}
```

### PATCH /clubs/:id
更新社團資料 (需為管理員)

### POST /clubs/:id/join
加入社團

**Response 200:**
```json
{ "message": "成功加入社團", "membersCount": 1206 }
```

### DELETE /clubs/:id/join
退出社團

**Response 200:**
```json
{ "message": "已退出社團", "membersCount": 1205 }
```

### GET /clubs/:id/activities
取得社團的活動列表

**Query Params:** `?status=OPEN|FULL|ENDED&page=1&limit=10`

### GET /clubs/:id/members
取得社團成員列表 (需為管理員)

---

## 貼文 (Posts)

### GET /clubs/:id/posts
取得社團貼文列表

**Query Params:** `?type=ANNOUNCEMENT|SHARE|PHOTO&page=1&limit=10`

**Response 200:**
```json
{
  "data": [
    {
      "id": "p1",
      "clubId": "c1",
      "author": { "id": "u1", "name": "Alex Chen", "avatar": "...", "isAdmin": true },
      "type": "ANNOUNCEMENT",
      "content": "下週二場地整修暫停...",
      "images": [],
      "likes": 24,
      "comments": 5,
      "isLiked": false,
      "createdAt": "2023-11-10T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 4, "totalPages": 1 }
}
```

### POST /clubs/:id/posts
發布新貼文 (需為社團成員)

```json
{
  "type": "SHARE",
  "content": "昨天的比賽超精彩！",
  "images": ["https://..."]
}
```

### PATCH /clubs/:clubId/posts/:postId
編輯貼文 (需為作者或管理員)

### DELETE /clubs/:clubId/posts/:postId
刪除貼文

### POST /clubs/:clubId/posts/:postId/like
對貼文按讚 (toggle)

**Response 200:**
```json
{ "isLiked": true, "likes": 25 }
```

### GET /clubs/:clubId/posts/:postId/comments
取得留言列表

**Response 200:**
```json
{
  "data": [
    { "id": "cm1", "author": { "id": "u2", "name": "Sarah Wu", "avatar": "..." }, "content": "這張照片拍得真好！", "createdAt": "..." }
  ]
}
```

### POST /clubs/:clubId/posts/:postId/comments
新增留言

```json
{ "content": "這張照片拍得真好！" }
```

---

## 通知 (Notifications)

### GET /notifications
取得通知列表

**Query Params:** `?isRead=true|false&page=1&limit=20`

**Response 200:**
```json
{
  "unreadCount": 2,
  "data": [
    {
      "id": "n1",
      "type": "ACTIVITY",
      "title": "活動行前提醒",
      "content": "您報名的「週二晚間歡樂羽球」將於明日 19:00 開始",
      "time": "2023-11-13T10:00:00Z",
      "isRead": false,
      "linkId": "a1",
      "linkType": "activity"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5 }
}
```

### PATCH /notifications/:id/read
標記單一通知為已讀

### PATCH /notifications/read-all
標記全部通知為已讀

### DELETE /notifications/:id
刪除通知

---

## 圖片上傳 (Upload)

### POST /upload/presigned-url
取得 S3 預簽名 URL（前端直接上傳至 Storage）

**Request Body:**
```json
{
  "fileName": "activity-cover.jpg",
  "contentType": "image/jpeg",
  "folder": "activities|clubs|avatars|posts"
}
```

**Response 200:**
```json
{
  "uploadUrl": "https://r2.cloudflarestorage.com/...",
  "publicUrl": "https://cdn.gogosports.tw/activities/xyz.jpg"
}
```

---

## 錯誤格式 (Error Response)

所有錯誤統一格式：

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "活動已額滿，無法報名"
}
```

| Code | 意義 |
|------|------|
| 400 | 請求格式錯誤 / 業務規則違反 |
| 401 | 未登入 / Token 過期 |
| 403 | 無權限 |
| 404 | 資源不存在 |
| 409 | 衝突（已報名、已加入） |
| 422 | 資料驗證失敗 |
| 500 | 伺服器內部錯誤 |

---

## 資料庫 Schema (Prisma)

```prisma
model User {
  id                  String    @id @default(cuid())
  name                String
  email               String    @unique
  passwordHash        String
  phone               String?
  avatar              String?
  bio                 String?
  isClubAdmin         Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  registrations       Registration[]
  clubMemberships     ClubMember[]
  managedClubs        ClubAdmin[]
  posts               Post[]
  notifications       Notification[]
  refreshTokens       RefreshToken[]
}

model Activity {
  id                  String          @id @default(cuid())
  clubId              String
  club                Club            @relation(fields: [clubId], references: [id])
  title               String
  date                DateTime
  time                String
  location            String
  city                String
  price               Int
  mode                RegistrationMode
  status              ActivityStatus  @default(OPEN)
  maxParticipants     Int?
  currentInternalCount Int            @default(0)
  currentAppCount     Int             @default(0)
  groups              String[]
  level               Level
  image               String?
  description         String
  tags                String[]
  lat                 Float?
  lng                 Float?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  registrations       Registration[]
}

model Registration {
  id          String   @id @default(cuid())
  userId      String
  activityId  String
  group       String?
  status      RegistrationStatus @default(CONFIRMED)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  activity    Activity @relation(fields: [activityId], references: [id])

  @@unique([userId, activityId])
}

model Club {
  id          String   @id @default(cuid())
  name        String
  logo        String?
  coverImage  String?
  rating      Float    @default(0)
  description String
  tags        String[]
  city        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  activities  Activity[]
  members     ClubMember[]
  admins      ClubAdmin[]
  posts       Post[]
}

model ClubMember {
  userId    String
  clubId    String
  joinedAt  DateTime @default(now())

  user      User   @relation(fields: [userId], references: [id])
  club      Club   @relation(fields: [clubId], references: [id])

  @@id([userId, clubId])
}

model ClubAdmin {
  userId    String
  clubId    String

  user      User   @relation(fields: [userId], references: [id])
  club      Club   @relation(fields: [clubId], references: [id])

  @@id([userId, clubId])
}

model Post {
  id        String   @id @default(cuid())
  clubId    String
  authorId  String
  type      PostType
  content   String
  images    String[]
  likes     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  club      Club     @relation(fields: [clubId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
  comments  Comment[]
  likedBy   PostLike[]
}

model PostLike {
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user      User   @relation(fields: [userId], references: [id])
  post      Post   @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  authorId  String
  content   String
  createdAt DateTime @default(now())

  post      Post   @relation(fields: [postId], references: [id])
  author    User   @relation(fields: [authorId], references: [id])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  content   String
  isRead    Boolean          @default(false)
  linkId    String?
  linkType  String?
  createdAt DateTime         @default(now())

  user      User   @relation(fields: [userId], references: [id])
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User   @relation(fields: [userId], references: [id])
}

enum RegistrationMode   { LIMITED OPEN }
enum ActivityStatus     { OPEN FULL CANCELLED ENDED }
enum RegistrationStatus { CONFIRMED WAITLISTED CANCELLED }
enum Level              { BEGINNER INTERMEDIATE ADVANCED PRO }
enum PostType           { ANNOUNCEMENT SHARE PHOTO }
enum NotificationType   { SYSTEM ACTIVITY INTERACTION INVITE }
```

---

## 實作建議順序

1. **Phase 1 - 核心功能**
   - Auth (register/login/refresh)
   - Activities CRUD + 篩選搜尋
   - Registrations (報名/取消)

2. **Phase 2 - 社群功能**
   - Clubs CRUD + join/leave
   - Posts + likes + comments

3. **Phase 3 - 通知 & 進階**
   - Notifications
   - 圖片上傳 (Presigned URL)
   - 推播通知 (FCM/APNs)
   - Rate Limiting + Redis Cache
