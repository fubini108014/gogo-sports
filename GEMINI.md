# Gemini CLI — 開發規範 (GEMINI.md)

本文件定義了 Gemini CLI 在協助開發 GoGo Sports 專案時必須嚴格遵守的架構與開發原則。

## 1. Modal 元件掛載規範 (核心 mandate)

**所有 Modal 元件必須統一在 `components/Layout.tsx` 的最底部掛載。** 絕對禁止在個別 Page 或子 Component 內部宣告或直接掛載 Modal。

### 實作流程：
1.  **元件建立**：在 `components/modals/` 建立 Modal 元件，必須包含 `isOpen: boolean` 與 `onClose: () => void` Props。
2.  **狀態管理**：
    *   若 Modal 開關需由多個元件觸發（如：登入、日期選擇），請在 `context/AppContext.tsx` 中定義 state 與 toggle handler。
    *   若 Modal 僅供 `Layout` 內部選單使用，則定義在 `Layout.tsx` 的 local state 中。
3.  **掛載位置**：在 `components/Layout.tsx` 引入 Modal 並掛載於 JSX 的最底部（通常在 `<Toast />` 之上）。

### 範例：
```tsx
// ❌ 錯誤：在 Component 內部掛載
const MyComponent = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      <MyModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

// ✅ 正確：AppContext.tsx 定義狀態
const [isDateModalOpen, setIsDateModalOpen] = useState(false);

// ✅ 正確：Layout.tsx 統一掛載
<DateSelectModal 
  isOpen={isDateModalOpen} 
  onClose={() => setIsDateModalOpen(false)} 
  ... 
/>
```

## 2. 狀態管理原則

*   **全域狀態**：跨頁面、跨元件之資料或 Modal 開關，一律放 `AppContext.tsx`。
*   **封裝修改**：子元件禁止直接修改 Context state，必須呼叫 Context 提供的 handler 函式。
*   **命名規範**：Modal 開關狀態命名為 `is[Name]ModalOpen`，控制函式為 `setIs[Name]ModalOpen`。

## 3. UI 與樣式規範

*   **Dark Mode**：嚴格使用 Tailwind CSS 的 `dark:` 前綴，禁止 inline-style 或 JS 邏輯判斷主題。
*   **回饋機制**：一律使用 `AppContext` 的 `addToast(message, type)`。禁止使用原生 `alert()`。
*   **一致性**：新開發的 Modal 必須參考 `AuthModal.tsx` 的樣式（圓角、陰影、動畫、關閉按鈕佈局）。

## 4. 研究、策略、執行 (R-S-E) 流程

1.  **Research**：先搜尋 `CLAUDE.md` 與 `GEMINI.md` 確認規範，並參考現有實作（如 `AuthModal`）。
2.  **Strategy**：在修改前說明預計更動的檔案與邏輯。
3.  **Execution**：精確執行修改，並確保所有 side-effects（如 Context 狀態新增）皆已處理。
4.  **Validation**：確認修改符合規範，無遺漏。

---
*本文件為 Gemini CLI 的最高指導原則，優先於一般開發慣例。*
