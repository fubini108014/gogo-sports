# GoGo Sports — 規格書索引

> v1.1 | 2026-04-04

**GoGo Sports** 是台灣運動社群揪團平台，讓使用者快速找到活動、加入社團、認識同好。

## 子文件目錄

| 檔案 | 內容 |
|------|------|
| [data-models.md](data-models.md) | Enums + 核心資料模型 |
| [features.md](features.md) | 已完成功能清單（依模組） |
| [api.md](api.md) | 所有後端 API 端點 |
| [routes.md](routes.md) | 前端路由 + Layout + 底部導覽 |
| [backlog.md](backlog.md) | 待確認事項 + 設計決策紀錄 |

---

## 使用者角色

| 角色 | 說明 | 主要功能 |
|------|------|----------|
| **訪客** | 未登入 | 瀏覽活動、社團（無法報名或加入） |
| **一般會員** | 已登入 | 搜尋/報名活動、加入社團、發文留言、通知 |
| **社團管理員** | 管理社團的會員 | 新增活動、管理成員、發公告、刪除貼文/留言 |
| **系統管理員** | 後台（未實作） | 未來擴充：審核社團、停權使用者 |

---

## 技術架構

### 前端

| 項目 | 技術 |
|------|------|
| 框架 | React 19.2.4 + TypeScript |
| 建置 | Vite |
| 樣式 | Tailwind CSS（Dark Mode） |
| 路由 | React Router v6 |
| 狀態 | React Context（AppContext） |
| 地圖 | React-Leaflet + Leaflet |
| 圖示 | Lucide React |
| 拖曳 | dnd-kit |
| 驗證 | Zod |

### 後端

| 項目 | 技術 |
|------|------|
| 框架 | Fastify 4.28.1 + TypeScript |
| ORM | Prisma |
| 資料庫 | PostgreSQL（開發用 SQLite） |
| 認證 | JWT（Access + Refresh Token） |
| 安全 | helmet、cors、rate-limit（100 req/min） |
| 上傳 | @fastify/multipart + @fastify/static |
| 密碼 | bcryptjs |

### 環境

| 項目 | 設定 |
|------|------|
| 前端開發 | `npm run dev`（port 5173） |
| 後端開發 | `npm run dev`（tsx watch，port 3000） |
| API Base URL | `http://localhost:3000/v1` |
| 圖片儲存 v1 | 本地 `backend/uploads/`，`/static/uploads/:filename` |
| 圖片儲存未來 | 雲端物件儲存（AWS S3 / GCS） |
