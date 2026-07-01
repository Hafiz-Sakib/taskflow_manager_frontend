# TaskFlow — Frontend

A full task manager & to-do app: boards with Kanban columns, drag-and-drop, calendar, and stats — built as a responsive web app with React, React Router, and Tailwind CSS.

## Core features

- **Auth** — register / login, JWT stored in `localStorage`, session restored on reload
- **Dashboard** — totals across all boards, per-board progress, upcoming deadlines
- **Boards** — create/delete boards with custom columns
- **Kanban board** — create/edit/delete tasks, drag-and-drop between columns
- **Calendar** — month view with due-date dots, click a day to see its tasks
- **Statistics** — completion rate, tasks by column, tasks by priority, per-board progress
- **Dark mode**, **responsive layout** (sidebar on desktop, drawer on mobile), **toast notifications**

## New in this update (11 additions + a bug fix)

1. **Quick-add task** — type a title straight into a column and hit Enter, no modal needed
2. **Complete checkbox (to-do style)** — tick a task to send it to the board's "Done" column, untick to send it back
3. **Board settings** — rename a board, edit its description, and add / rename / reorder / remove columns after creation
4. **Global search** — press `/` or `Ctrl+K` anywhere to search task titles across every board and jump straight to it
5. **Sort control** — order tasks within a board by Manual / Priority / Due date / Newest
6. **List view** — toggle a Kanban board into a flat, sortable table (useful for scanning many tasks at once)
7. **Bulk select & actions** — "Select" mode lets you tick multiple tasks and move or delete them together
8. **Export** — download a board's visible tasks as CSV or JSON
9. **Pin boards** — star a board from the Boards page or the board itself; pinned boards get their own section on Boards and Dashboard
10. **Today view** — a dedicated page listing everything overdue or due today across all boards, with one-tap complete
11. **Overdue/due-today reminder banner** — shown on the Dashboard when action is needed, linking to Today
12. Per-board **sort/view choice is remembered** (saved to `localStorage` per board)

**Bug fix:** clearing a task's due date in the edit form now actually clears it (previously the empty value was silently dropped and the old date stuck around).

## Tech stack

- React 18 + React Router 6
- Tailwind CSS 3 (utility-first, dark mode via `class` strategy)
- Vite 5
- Native HTML5 drag-and-drop (no extra DnD library)
- Plain `fetch` wrapper for the API (no axios/react-query — kept dependency-free)

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev
```

```
VITE_API_URL=http://localhost:5000/api
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  api/client.js             fetch wrapper for the backend REST API
  context/
    AuthContext.jsx          login state, token in localStorage
    ThemeContext.jsx          dark/light mode
    ToastContext.jsx          toast notifications
  components/
    AppLayout.jsx             sidebar + responsive shell + global search shortcut
    Sidebar.jsx / Topbar.jsx
    KanbanColumn.jsx           drag/drop column + quick-add
    TaskCard.jsx                draggable card, complete checkbox, select checkbox
    TaskModal.jsx                create/edit task form
    BoardSettingsModal.jsx       rename board, manage columns
    GlobalSearchModal.jsx        cross-board task search (⌘K / "/")
    Modal.jsx / ConfirmDialog.jsx / EmptyState.jsx / Spinner.jsx
    PriorityBadge.jsx
  pages/
    Login.jsx / Register.jsx
    Dashboard.jsx              overview, stats, reminder banner, pinned boards
    Boards.jsx                 board list, pinning, per-board progress
    BoardDetail.jsx            Kanban/List views, sort, bulk actions, export, settings
    Today.jsx                  overdue + due-today tasks across all boards
    Calendar.jsx                month calendar of due dates
    Statistics.jsx               charts
  utils/helpers.js            dates, priority meta, pinning, csv export, sorting
```

## Notes

- Tasks move between columns via native HTML5 drag-and-drop, quick-add, the edit modal, or bulk move — all save through `PUT /api/tasks/:id`.
- "Done" detection is case-insensitive on the column name (`Done`, `done`, `DONE` all count) — used for the complete checkbox, overdue/due-soon flags, and completion stats.
- Pinning and per-board sort/view preferences are stored client-side in `localStorage` (no backend field for these) — they're per-browser, not synced across devices.
- Dashboard, Today, Calendar, and Statistics all aggregate data by fetching every board's detail (`GET /api/boards/:id`) client-side — fine at small/medium scale; a dedicated aggregate endpoint would be a good backend addition if boards grow large.
