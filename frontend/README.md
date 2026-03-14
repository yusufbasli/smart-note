# Smart Note Frontend

Expo + React Native client for Smart Note. Works on:
- Web (`expo start --web`)
- Android emulator/device
- iOS simulator/device

## Tech Stack

- Expo + React Native + TypeScript
- React Navigation
- NativeWind
- Zustand + AsyncStorage
- Axios

## Prerequisites

- Node.js 20+
- npm
- Backend API running on port `8000`

## Environment

Create frontend env file:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` according to where backend is running:

- Local web: `http://localhost:8000/api/v1`
- Android emulator: `http://10.0.2.2:8000/api/v1`
- Physical device: `http://<YOUR_LAN_IP>:8000/api/v1`

## Run

```bash
npm install
npm run start
```

For web directly:

```bash
npm run web
```

## Validation

```bash
npm run typecheck
```

## Main Features

- Register / login / persisted session
- Notes list with search + category filters
- Create/edit/delete notes
- AI analyze trigger on notes
- Inline task management
- Dashboard with period filters (`today`, `tomorrow`, `week`, `all`)
- Standalone tasks with recurring support

## Quick Demo Flow

1. Register and log in.
2. Create a note from the `+` button.
3. Add tasks from note detail.
4. Open Dashboard and verify task visibility by period.
5. Edit, complete, and delete tasks from dashboard controls.

## Troubleshooting

- Cannot connect to API: check `EXPO_PUBLIC_API_BASE_URL` in `.env`.
- App works on web but not mobile device: use your LAN IP instead of `localhost`.
- AI action fails: backend may return `503` when OpenAI quota is unavailable.
