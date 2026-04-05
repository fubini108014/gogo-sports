# 資料模型

## Enums

### RegistrationMode
| 值 | 說明 |
|----|------|
| `LIMITED` | 固定名額制（羽球、籃球），有 `maxParticipants` 上限 |
| `OPEN` | 開放分組制（登山、跑步），依組別報名 |

### ActivityStatus
| 值 | 顯示 | 說明 |
|----|------|------|
| `OPEN` | 報名中 | 開放報名 |
| `FULL` | 已額滿 | 可候補 |
| `CANCELLED` | 已取消 | — |
| `ENDED` | 已結束 | — |

### Level
| 值 | 顯示 |
|----|------|
| `BEGINNER` | 新手友善 |
| `INTERMEDIATE` | 中階 |
| `ADVANCED` | 高階 |
| `PRO` | 專業 |

### PostType
| 值 | 顯示 |
|----|------|
| `ANNOUNCEMENT` | 公告 |
| `SHARE` | 閒聊 |
| `PHOTO` | 相簿 |

### NotificationType
| 值 | 說明 |
|----|------|
| `SYSTEM` | 系統公告 |
| `ACTIVITY` | 活動提醒/更新 |
| `INTERACTION` | 貼文互動 |
| `INVITE` | 社團邀請 |

### ClubMemberRank
| 值 | 稱號 | 門檻 | 徽章色 |
|----|------|------|--------|
| `NEWBIE` | 新手 🌱 | 0–2 次 | gray |
| `REGULAR` | 熟手 ⚡ | 3–9 次 | blue |
| `VETERAN` | 老手 🔥 | 10–19 次 | orange |
| `VIP` | VIP 👑 | 20+ 次 | yellow |

計算函式：`calcClubMemberRank(activityCount)` 在 `types.ts`。以**社團為單位**計算，等級僅供展示。

---

## 核心資料模型

### Activity
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `clubId` | string | 所屬社團 |
| `title` | string | — |
| `date` | string | YYYY-MM-DD |
| `time` | string | HH:MM |
| `location` | string | — |
| `price` | number | 0 = 免費 |
| `mode` | RegistrationMode | — |
| `status` | ActivityStatus | — |
| `maxParticipants` | number? | LIMITED |
| `currentInternalCount` | number? | LIMITED，Line/FB 報名 |
| `currentAppCount` | number | — |
| `groups` | string[]? | OPEN，如「5分速」 |
| `level` | Level | — |
| `image` | string | URL |
| `description` | string | — |
| `tags` | string[] | — |
| `lat` / `lng` | number? | 地圖座標 |

### Club
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `name` | string | — |
| `logo` | string | URL |
| `rating` | number | 0–5 |
| `membersCount` | number | — |
| `description` | string | — |
| `tags` | string[] | — |

### User
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `name` | string | — |
| `avatar` | string | URL |
| `isClubAdmin` | boolean | — |
| `registeredActivityIds` | string[] | — |
| `joinedClubIds` | string[] | — |
| `managedClubIds` | string[] | — |

### ClubMember
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `name` | string | — |
| `avatar` | string | URL |
| `email` | string | — |
| `joinedAt` | string | ISO |
| `activityCount` | number | 該社團參與次數 |
| `rank` | ClubMemberRank | 由 activityCount 導出 |

### Post
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `clubId` | string | — |
| `author` | object | `{id, name, avatar, isAdmin, rank?}` |
| `type` | PostType | — |
| `content` | string | — |
| `images` | string[]? | PHOTO 類型 |
| `createdAt` | string | ISO |
| `likes` | number | — |
| `comments` | number | — |
| `isLiked` | boolean | 當前使用者 |

### CommentItem
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `postId` | string | — |
| `parentId` | string? | null = 頂層 |
| `author` | object | `{id, name, avatar}` |
| `content` | string | — |
| `createdAt` | string | ISO |
| `replies` | CommentItem[] | 最多兩層 |

### Notification
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `type` | NotificationType | — |
| `title` | string | — |
| `content` | string | — |
| `time` | string | 相對時間 |
| `isRead` | boolean | — |
| `linkId` | string? | 活動或社團 ID |

### ExploreTag
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `label` | string | — |
| `icon` | string | Emoji |
| `colorKey` | string | 8 種預設色 |
| `filters` | ExploreTagFilters | 篩選條件 |
| `isSystem` | boolean | 不可刪除 |
| `enabled` | boolean | 顯示於首頁 |

### FilterState
| 欄位 | 型別 | 說明 |
|------|------|------|
| `cities` | string[] | 台灣 22 縣市 |
| `date` | string | YYYY-MM-DD |
| `minPrice` | string | — |
| `maxPrice` | string | — |
| `levels` | string[] | — |
| `isNearlyFull` | boolean | — |
