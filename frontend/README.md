# Smart Note — Frontend

Expo React Native client for Smart Note. Runs on **web**, **Android**, and **iOS** from a single codebase with a responsive layout that adapts to each form factor.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo 55, React Native 0.83 |
| Language | TypeScript |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| State management | Zustand 5, AsyncStorage (persisted auth token) |
| HTTP | Axios |
| Styling | React Native StyleSheet |

---

## Prerequisites

- Node.js 20+
- npm
- Backend API running on port `8000` (see [backend/README.md](../backend/README.md))

---

## Environment Setup

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` to match your backend:

| Scenario | Value |
|----------|-------|
| Local web | `http://localhost:8000/api/v1` |
| Android emulator | `http://10.0.2.2:8000/api/v1` |
| Physical device (same Wi-Fi) | `http://<YOUR_LAN_IP>:8000/api/v1` |

---

## Running

```bash
npm install

# Interactive menu (choose web / Android / iOS)
npx expo start

# Web directly
npx expo start --web

# Specific platform
npx expo start --android
npx expo start --ios
```

---

## Validation

```bash
npm run typecheck
```

---

## Responsive Design

The UI uses `useWindowDimensions` to apply a 768 px breakpoint:

| Viewport | Navigation | Layout |
|----------|-----------|--------|
| ≥ 768 px (desktop/tablet) | Persistent top navigation bar | Centered content, 2-column note grid |
| < 768 px (mobile) | Bottom tab bar | Single-column, full-width |

The top navigation bar (desktop) shows the active tab highlight, the current username, and a Sign out button. The bottom tab bar (mobile) uses icon + label pairs with an active background pill.

---

## Features

- Register, login, and persistent session via AsyncStorage
- Notes list with search and category chip filters
- Two-column notes grid on desktop; single column on mobile
- Create / edit / delete notes with a centered form (max-width 640 px on desktop)
- AI analysis trigger on note detail — displays summary and AI-assigned category badge
- Inline task management on note detail with progress bar
- Dashboard with period filters (`today`, `tomorrow`, `week`, `all`)
- Standalone tasks with optional recurring (daily-reset) flag
- Date picker strip for selecting task due dates
- Pull-to-refresh on all list screens

---

## Project Structure

```
frontend/src/
├── api/               # Axios instances and endpoint helpers
├── components/        # Shared UI components (CategoryBadge, TaskItem, DesktopHeader)
├── navigation/        # React Navigation stacks and tabs (MainTabs, NotesStack, AuthStack)
├── screens/           # Screen components (Login, Register, NotesList, NoteDetail, NoteForm, Dashboard)
├── store/             # Zustand stores (authStore, notesStore)
├── theme/             # Design tokens (colors, radius, shadow, layout, CATEGORY_META)
└── types/             # TypeScript API types
```

---

## Quick Demo Flow

1. Open http://localhost:8081 and register an account.
2. Tap **+** to create a note — AI analysis runs automatically on save.
3. Open the note, add tasks in the **Tasks** section.
4. Navigate to **Dashboard** and switch period tabs to view tasks by date.
5. Mark tasks done, edit, or delete them from the dashboard controls.
6. Tap **✨ Analyse** on a note detail page to re-run AI category and summary.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Cannot reach API | Check `EXPO_PUBLIC_API_BASE_URL` in `.env` |
| Works on web, fails on device | Use your LAN IP instead of `localhost` |
| AI action fails with `503` | Backend is returning an OpenAI quota error — note is still saved |
| Screen layout broken | Resize the window across the 768 px breakpoint to trigger the layout switch |
