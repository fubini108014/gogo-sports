<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GoGo Sports — 台灣運動社群揪團平台

React 19 + TypeScript + Vite 前端，搭配 Fastify + Prisma + PostgreSQL 後端。

## 環境需求

- Node.js 18+
- Docker Desktop

---

## 首次設定

### 1. 安裝前端依賴

```bash
npm install
```

### 2. 安裝後端依賴並產生 Prisma Client

```bash
cd backend
npm install
npx prisma generate
```

### 3. 啟動資料庫（Docker）

```bash
docker run -d --name gogosports-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=gogosports \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. 執行資料庫 Migration 與 Seed

```bash
cd backend
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

測試帳號：`alex@example.com` / `password123`

---

## 每次開發啟動步驟

### 1. 啟動資料庫

```bash
docker start gogosports-db
```

### 2. 啟動後端（開新終端機）

```bash
cd backend
npm run dev
```

後端跑在 `http://localhost:3000`

### 3. 啟動前端（開新終端機）

```bash
npm run dev
```

前端跑在 `http://localhost:5173`

---

## 停止服務

```bash
docker stop gogosports-db   # 停止資料庫
```

前端 / 後端在終端機按 `Ctrl + C` 停止。

---

## 專案結構

```
gogo-sports/
├── components/       # React 元件
├── context/          # AppContext 全域狀態
├── pages/            # 各頁面
├── services/         # API 呼叫（api.ts）
├── types.ts          # TypeScript 型別
├── constants.ts      # Mock 資料
└── backend/
    ├── src/
    │   ├── routes/   # API 路由
    │   ├── plugins/  # Fastify plugins（Prisma, JWT）
    │   └── server.ts
    └── prisma/
        ├── schema.prisma
        └── seed.ts
```

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 19, TypeScript, Vite, Tailwind CSS |
| 路由 | React Router v6 |
| 地圖 | react-leaflet + OpenStreetMap |
| 後端 | Fastify, Prisma ORM |
| 資料庫 | PostgreSQL 16（Docker） |
| 認證 | JWT（access token + refresh token） |
