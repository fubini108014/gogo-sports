# 頁面與路由

## 路由清單

| 路由 | 頁面元件 | 說明 |
|------|----------|------|
| `/` | `HomePage` | 搜尋列、探索標籤、精選社團/活動 |
| `/activities` | `ActivityListPage` | 列表 + 地圖切換、篩選、Load More |
| `/activities/:id` | `ActivityDetailPage` | 詳情、地圖、報名入口 |
| `/clubs` | `ClubListPage` | 瀏覽社團 |
| `/clubs/:id` | `ClubProfilePage` | 動態/活動/相簿三頁籤、管理 |
| `/profile` | `UserProfilePage` | 我的活動、社團、設定（需登入） |
| `/notifications` | `NotificationsPage` | 通知列表（需登入） |
| `/messages` | `MessagesPage` | 對話清單（含 Layout） |
| `/messages/:id` | `ConversationPage` | 對話頁（全螢幕，無 Layout） |

## Layout

- **有 Layout**（`/` ～ `/messages`）：頂部 Navbar + 底部導覽列/Dock + 所有 Modal 掛載點
- **無 Layout**（`/messages/:id`）：全螢幕，自行處理導覽

## 底部導覽

| 位置 | 圖示 | 標籤 | 連結 |
|------|------|------|------|
| 左1 | 🏠 | 首頁 | `/` |
| 左2 | 🔍 | 探索活動 | `/activities` |
| 中央 | ➕ | 建立 | 開啟 CreateMenuModal |
| 右1 | 👥 | 探索社團 | `/clubs` |
| 右2 | 💬 | 訊息 | `/messages` |
