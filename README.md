# TaskFlow Frontend

React + Vite client for the TaskFlow API, styled to match the provided mobile UI screenshots (Home dashboard, Calendar, Statistics), set in Hind Siliguri.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend
npm run dev
```

Requires the TaskFlow backend running (see backend/README or .env.example there).

## Structure

- `src/pages` — Home, Calendar, Statistics, Login, Register
- `src/components` — BottomNav + shared styles
- `src/context/AuthContext.jsx` — login state, token stored in localStorage
- `src/api/client.js` — fetch wrapper for the backend REST API
