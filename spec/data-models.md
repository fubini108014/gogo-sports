# 資料模型

## Enums

### PrimarySport
| 值 | 顯示名稱 |
|----|------|
| `BADMINTON` | 羽球 |
| `VOLLEYBALL` | 排球 |
| `BASKETBALL` | 籃球 |
| `TABLE_TENNIS` | 桌球 |
| `TENNIS` | 網球 |
| `PICKLEBALL` | 匹克球 |
| `HIKING` | 登山 |
| `RUNNING` | 路跑 |
| `OTHER` | 其他 |

### RegistrationMode
| 值 | 說明 |
|----|------|
| `LIMITED` | 固定名額制（羽球、籃球），有 `maxParticipants` 上限 |
| `OPEN` | 開放分組制（登山、跑步），依組別報名 |

### ApprovalMode
| 值 | 說明 |
|----|------|
| `AUTO` | 自動接受：報名即成功（有名額時） |
| `MANUAL` | 手動審核：需主揪同意，審核中不佔名額 |

### ActivityStatus
| 值 | 顯示 | 說明 |
|----|------|------|
| `OPEN` | 報名中 | 開放報名 |
| `FULL` | 已額滿 | 依然可以報名（進入候補） |
| `CANCELLED` | 已取消 | — |
| `ENDED` | 已結束 | 日期過後自動轉變，觸發 XP 發放 |

### RegistrationStatus
| 值 | 顯示 | 說明 |
|----|------|------|
| `PENDING` | 待審核 | MANUAL 模式初始狀態 |
| `APPROVED` | 已通過 | 成功報名，佔用名額 |
| `REJECTED` | 已婉拒 | 主揪拒絕，不佔名額 |
| `WAITLISTED` | 候補中 | 額滿後報名或被主揪放入候補 |
| `CANCELLED` | 已取消 | 使用者自行取消 |
| `ABSENT` | 未出席 | 活動結束後由主揪標記，扣除 XP |

### PostType
| 值 | 顯示 |
|----|------|
| `ANNOUNCEMENT` | 公告 |
| `SHARE` | 閒聊 |
| `PHOTO` | 相簿 (上限 10 張) |

### NotificationType
| 值 | 說明 |
|----|------|
| `SYSTEM` | 系統公告 |
| `ACTIVITY` | 活動提醒/更新 |
| `INTERACTION` | 貼文互動 |
| `INVITE` | 社團邀請 |
| `BROADCAST` | 主揪廣播 (含圖/地圖) |

### ReportReason
| 值 | 說明 |
|----|------|
| `SPAM` | 垃圾訊息 / 廣告 |
| `VIOLENCE` | 言語暴力 / 恐嚇 |
| `INAPPROPRIATE_CONTENT` | 不當圖片 / 色情內容 |
| `HARASSMENT` | 騷擾行為 |
| `OTHER` | 其他 |

---

## 核心資料模型

### Blacklist (主揪黑名單)
| 欄位 | 型別 | 說明 |
|------|------|------|
| `hostId` | string | 發起封鎖的人 |
| `blockedUserId` | string | 被封鎖的人 |
| `createdAt` | string | ISO |

### Report (檢舉記錄)
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `reporterId` | string | 檢舉人 |
| `targetType` | string | `USER`, `POST`, `MESSAGE` |
| `targetId` | string | 被檢舉的 ID |
| `reason` | ReportReason | 檢舉理由 |
| `content` | string? | 補充說明 |
| `status` | string | `PENDING`, `RESOLVED` |

### ClubInviteLink (社團邀請連結)
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `clubId` | string | — |
| `token` | string | 唯一的 URL token |
| `expiresAt` | string | 過期時間 |
| `requireApproval` | boolean | 透過連結加入是否仍須審核 |

### Activity
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `hostId` | string | 主揪 User ID (必填) |
| `clubId` | string? | 所屬社團 ID (選填，個人團為 null) |
| `title` | string | — |
| `primarySport` | PrimarySport | 主要運動分類 (用於稱號計算) |
| `date` | string | YYYY-MM-DD |
| `time` | string | HH:MM |
| `location` | string | — |
| `city` | string | — |
| `price` | number | 0 = 免費 |
| `mode` | RegistrationMode | — |
| `approvalMode` | ApprovalMode | — |
| `status` | ActivityStatus | — |
| `maxParticipants` | number? | LIMITED 模式上限 |
| `currentAppCount` | number | 系統內已 APPROVED 的人數 |
| `minCancelHours` | number | 活動前 X 小時禁止取消 (預設 24) |
| `groups` | string[]? | OPEN 模式分組 |
| `level` | Level | — |
| `description` | string | — |
| `tags` | string[] | 額外標籤 |

### User
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `name` | string | — |
| `avatar` | string | URL |
| `bio` | string | 個人簡介 |
| `globalXP` | number | 全站總經驗值 |
| `sportXP` | JSON | 各運動項目的經驗值 `{BADMINTON: 500, HIKING: 20}` |
| `managedClubIds` | string[] | — |

### Registration
| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | — |
| `userId` | string | — |
| `activityId` | string | — |
| `status` | RegistrationStatus | — |
| `contactMethod` | string | 主揪聯繫方式 (Line ID, Phone 等) |
| `realName` | string | 真實姓名 (保險/聯繫用) |
| `group` | string? | OPEN 模式分組 |
| `transportation` | string? | 交通方式 |
| `createdAt` | string | ISO |


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
