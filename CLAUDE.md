# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000 (auto-opens browser)
npm run build     # production build → ./build/
```

No test runner or linter is configured.

## Architecture

Single-page React 18 app built with Vite + TypeScript. No routing, no state management library, no backend.

### App flow (`src/App.tsx`)

Three modes controlled by `AppMode` state (`'loading' | 'auth' | 'game'`):

1. **loading** — `initDb()` initializes SQLite WASM; shows a spinner
2. **auth** — renders `<AuthScreen>` (sign in / sign up / guest)
3. **game** — renders the chest-clicking game

`currentUser: User | null` distinguishes signed-in users from guests throughout the game mode. A `useEffect` on `gameEnded` saves the score to SQLite and refreshes `scoreHistory` for signed-in users.

### Auth & database (`src/db.ts`, `src/AuthScreen.tsx`)

- **`src/db.ts`**: all SQLite logic. Uses `sql.js` (SQLite compiled to WASM). The database binary is serialized to `localStorage` (`btoa`/`atob`) after every write so it survives page reloads. Exports: `initDb`, `signUp`, `signIn`, `saveScore`, `getScores`. Password hashing uses `crypto.subtle.digest('SHA-256', ...)` — no external crypto library.
- **`src/AuthScreen.tsx`**: sign in / sign up UI. Contains two separate subcomponents — `SignInForm` and `SignUpForm` — each with its own `useForm` instance. This is intentional: Radix UI `TabsContent` keeps both panels in the DOM simultaneously, so a shared `useForm` would have conflicting field registrations.

**SQLite schema:**
```sql
users  (id, username UNIQUE, password_hash)
scores (id, user_id, score, result TEXT, played_at INTEGER)
```

### Game mechanics (`src/App.tsx`)

- 3 treasure boxes, one randomly assigned `hasTreasure: true` per `initializeGame()` call
- Treasure box: +$100; skeleton box: -$50
- Game ends when treasure found or all boxes opened
- Animations via `motion/react`; sound via `new Audio(url).play()`
- Custom key cursor (`src/assets/key.png`) on closed-chest hover via inline `style.cursor`

### UI components (`src/components/ui/`)

shadcn/ui primitives — Radix UI + Tailwind, vendored as source files. Edit directly if needed.

**Known gotcha**: `Input` (`src/components/ui/input.tsx`) uses `React.forwardRef` — required for `react-hook-form` to read field values. Do not remove it.

### Static assets

- Images: `src/assets/` (treasure_closed.png, treasure_opened.png, treasure_opened_skeleton.png, key.png)
- Audio: `src/audios/` (chest_open.mp3, chest_open_with_evil_laugh.mp3)

### Vite config notes

- Path alias: `@` → `src/`
- Build output: `./build/` (not `dist/`)
- WASM loading: `sql.js` WASM is imported via `import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url'` and passed to `initSqlJs({ locateFile: () => sqlWasm })` — this makes Vite copy the file into the build with a content hash
- All versioned deps have aliased entries in `vite.config.ts`; new deps don't need aliases unless they use versioned import paths
