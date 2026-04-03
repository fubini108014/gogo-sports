# GoGo Sports — 開發規範

## 1. Modal 掛載點

**所有 Modal 元件統一在 `components/Layout.tsx` 最底部宣告**，不在 Page 或子元件內自行掛載。

```tsx
// ✅ 正確：Layout.tsx 底部
<MyNewModal isOpen={isMyModalOpen} onClose={() => setIsMyModalOpen(false)} />

// ❌ 錯誤：在 Page 或 Component 內掛載
// pages/SomePage.tsx 內不應出現 <MyNewModal />
```

步驟：
1. 在 `components/` 建立 Modal 元件，props 包含 `isOpen: boolean` + `onClose: () => void`
2. 若開關狀態需跨元件共用 → 放進 `AppContext`；若只有 Layout 用到 → 放在 Layout local state
3. 在 `Layout.tsx` import 並掛載於 `<Toast />` 上方

---

## 2. 狀態管理

- **全域狀態**（跨頁面、跨元件）→ `context/AppContext.tsx`
- **Layout-local 狀態**（只影響 Layout 內的 create menu 流程）→ `Layout.tsx` 的 `useState`
- **Page-local 狀態**（搜尋字串、filter、viewMode）→ 各 Page 元件自己的 `useState`
- 禁止在子元件內直接修改 context，一律透過 context 提供的 handler 函式

---

## 3. 通知與回饋

- 統一使用 `addToast(message, type)` 顯示操作回饋
- 禁止使用 `alert()`、`confirm()`、`console.log` 在正式功能中

```tsx
// ✅
addToast('報名成功！', 'success');

// ❌
alert('報名成功！');
```

---

## 4. Dark Mode

- 全部使用 Tailwind `dark:` class，不用 inline style 或 JS 判斷
- Dark mode 狀態由 `AppContext.darkMode` 控制，在 `index.tsx` 根節點切換 `dark` class

```tsx
// ✅
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// ❌
<div style={{ background: darkMode ? '#111' : '#fff' }}>
```

---

## 5. 路由

- 新頁面統一在 `App.tsx` 的 `<Routes>` 中新增 `<Route>`
- 導頁使用 `useNavigate()`，禁止使用 `window.location.href`
- Page 元件放在 `pages/` 目錄，命名為 `XxxPage.tsx`

```tsx
// ✅
const navigate = useNavigate();
navigate('/activities/123');

// ❌
window.location.href = '/activities/123';
```

---

## 6. 元件職責劃分

- **Page (`pages/`)** — 薄包裝，只負責從 context/useParams 取資料，傳給 component
- **Component (`components/`)** — 負責 UI 渲染與 local 互動邏輯
- **Context (`context/AppContext.tsx`)** — 全域資料與 handler，不含 JSX

避免在 Page 內寫大量 JSX；避免在 Component 內直接呼叫 API 或修改全域狀態。
