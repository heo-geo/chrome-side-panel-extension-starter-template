# Chrome Side Panel Extension — Starter Template

A minimal Chrome Manifest V3 side panel template with React, TypeScript, SCSS, and Vite. Use it as a starting point for developer tools or other side panel extensions. Replace the domain logic (page detection, tabs content) while keeping the structure.

---

## Tech Stack

| Layer    | Choice                      | Notes                    |
| -------- | --------------------------- | ------------------------ |
| Build    | Vite + `@vitejs/plugin-react` | Fast builds, clean `dist/` |
| UI       | React 18                    | Component-based panel    |
| Language | TypeScript (strict)         | See rules below          |
| Styles   | SCSS, BEM                   | Split partials in `src/scss/` |
| Validation | Zod (optional)            | For API/storage parsing  |

---

## Project Structure

```
template/
├── manifest.json          # MV3 manifest, side panel entry
├── background.js          # Service worker — opens panel on action click
├── index.html             # Vite entry
├── vite.config.ts
├── tsconfig.json
├── package.json
├── icons/
└── src/
    ├── main.tsx           # React root
    ├── App.tsx            # Root — page detection (usePageReady), layout
    ├── types.ts           # Shared types (e.g. TabId)
    ├── locales.ts         # All user-facing strings (no hardcoded text in components)
    ├── hooks/
    │   ├── usePageReady.ts   # Detects if active tab is valid; tab listeners
    │   ├── useStorage.ts     # chrome.storage (session / local / sync)
    │   └── useTabFetch.ts    # CORS-safe fetch via active tab’s page context
    ├── scss/
    │   ├── styles.scss       # Main entry — @use partials
    │   ├── _variables.scss
    │   ├── _reset.scss, _layout.scss, _tab-nav.scss, _tab-content.scss
    │   ├── _footer.scss, _not-ready.scss, _spinner.scss, _buttons.scss, _tabs.scss
    │   └── functions.scss
    └── components/
        ├── Tabs.tsx        # Tab nav + content (TabA / TabB)
        ├── Footer.tsx
        ├── Spinner.tsx
        ├── NotReady.tsx    # “Not ready” / error + retry
        └── tabs/
            ├── TabA.tsx
            └── TabB.tsx
```

---

## Build & Load

```bash
npm install
npm run dev    # watch build
npm run build  # production → dist/
```

Load in Chrome:

1. Open `chrome://extensions`, enable **Developer mode**
2. **Load unpacked** → select the `dist/` folder
3. Click the extension icon to open the side panel

---

## TypeScript Rules

Keep these in `tsconfig.json`:

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`
- `target: "ES2020"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`

**Code style:**

- Prefer **type guards or Zod** over `as` casts for data from APIs or storage.
- Use **function expressions**, not declarations; export components as `export const Component = () => { ... }`.

---

## Storage (useStorage)

Three hooks match the [Chrome storage API](https://developer.chrome.com/docs/extensions/reference/api/storage#example-session): **session**, **local**, **sync**. Same API: `[value, setValue] = useStorage(key, defaultValue)`.

| Hook / area | Use case |
| ----------- | -------- |
| **session** | In-memory; cleared when extension reloads or browser restarts. Per-session state (e.g. form drafts). |
| **local**   | Persisted on device (~10 MB). Settings, larger data. Cleared when extension is removed. |
| **sync**    | Synced across Chrome when user is signed in (~100 KB total, 8 KB per item). User preferences. |

Switch the default by changing the alias at the bottom of `src/hooks/useStorage.ts` (e.g. `export { useStorageSession as useStorage }`).

---

## Fetch from panel (useTabFetch)

The panel runs on `chrome-extension://`. Direct `fetch()` to a page’s API (e.g. `https://example.com/api`) is blocked by CORS. **useTabFetch** runs the request in the **active tab’s page context** via `chrome.scripting.executeScript`, so the request uses the page’s origin and avoids CORS.

```
Panel (chrome-extension://)  →  executeScript  →  page context  →  page API
```

- **Returns:** `{ loading, result, send }`. `result` has `status`, `statusText`, `data`, `time`, and optional `error`.
- **send(method, path, body?):** Performs the request in the active tab. `body` must be JSON-serializable (it is stringified when passed to the injected script).
- Only use when the user has a page open that should receive the request; combine with `usePageReady` so the panel is only shown on valid tabs.

Example:

```ts
const { loading, result, send } = useTabFetch()

const handleSubmit = () => {
  send('POST', '/api/endpoint', { key: 'value' })
}

// result.data is the parsed JSON response (or null)
```

See `src/hooks/useTabFetch.ts` for the full implementation.

---

## Locales

Put every user-facing string in `src/locales.ts`. Components import and use them (no hardcoded copy in JSX).

```ts
const l = locales.tabA
const lc = locales.common
```

---

## Styling (SCSS)

- **Entry:** `src/scss/styles.scss` — it `@use`s variables, functions, and partials.
- **BEM:** `.block__element--modifier`; tab-scoped blocks: `.tab-name__element`.
- **Variables:** in `_variables.scss` (e.g. `$bg`, `$surface`, `$accent`, `$text-muted`).
- **Buttons:** `btn`, `btn--primary`, `btn--ghost`, `btn--icon`, `btn--sm`.

Add new partials in `src/scss/` and `@use` them in `styles.scss` to keep styles easy to navigate.

---

## Page Detection (usePageReady)

The panel only shows the main UI when the active tab is considered “ready”. Implement your own check in `src/hooks/usePageReady.ts` (e.g. URL, meta tag, or script injection). The hook returns `{ status, checkPage }` and subscribes to tab updates/activation so the UI updates when the user switches tabs.

---

## Manifest & Background

- **manifest.json:** `permissions` include `activeTab`, `scripting`, `sidePanel`, `storage`; `side_panel.default_path` is `index.html`.
- **background.js:** Typically calls `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` in `onInstalled`.

---

## Extending the Template

When you add forms, API calls from the panel, or more tabs: use `useStorage` for form state, add type guards or Zod for data from APIs or storage, and keep all user-facing strings in `locales.ts`. Use **useTabFetch** when the panel needs to call an API on the active tab’s origin (CORS-safe).
