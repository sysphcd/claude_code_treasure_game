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

Single-page React 18 app built with Vite + TypeScript. All game logic lives in one file: `src/App.tsx`. There is no routing, no state management library, and no backend.

**Game mechanics** (`src/App.tsx`):
- 3 treasure boxes, one randomly assigned `hasTreasure: true` on each `initializeGame()` call
- Opening the treasure box: +$100; opening a skeleton box: -$50
- Game ends when the treasure box is found, or all boxes are opened
- Animations via `motion/react` (the `motion` package); sound played via `new Audio(url).play()`

**UI components** (`src/components/ui/`): shadcn/ui primitives — Radix UI + Tailwind. These are vendored source files, not a build output; edit them directly if needed.

**Static assets**:
- Images: `src/assets/` (treasure_closed.png, treasure_opened.png, treasure_opened_skeleton.png, key.png)
- Audio: `src/audios/` (chest_open.mp3, chest_open_with_evil_laugh.mp3)

**Path alias**: `@` resolves to `src/` (configured in `vite.config.ts`).

**Build output**: `./build/` (not `dist/`).
