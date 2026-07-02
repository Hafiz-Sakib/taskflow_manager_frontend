# Migration Notes: Old to New

Old code, new code, why it's better — for the highest-impact changes. Smaller ones are summarized in the README.

---

## 1. Data fetching: manual fetch + local state to TanStack Query

**Old** (`Boards.jsx`):
```jsx
const [boards, setBoards] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  boardsApi.list().then(setBoards).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
}, []);
```
Every page reimplemented this loading/error/refetch dance by hand. Navigating away and back re-fetched from scratch every time, with a loading flash, even if nothing changed.

**New** (`hooks/useBoards.ts`):
```ts
export function useBoards(includeArchived = false) {
  return useQuery({
    queryKey: queryKeys.boards(includeArchived),
    queryFn: () => boardsApi.list(includeArchived),
  });
}
```
Used as `const { data: boards, isLoading } = useBoards()`. TanStack Query caches by key, dedupes concurrent calls, and skips the loading flash on revisit. Mutations invalidate the relevant keys instead of every component re-fetching manually.

---

## 2. Optimistic updates: none to real optimistic mutations

**Old** (drag-and-drop in `BoardDetail.jsx`):
```jsx
setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, column: targetColumn } : t)));
try {
  await tasksApi.update(task._id, { column: targetColumn });
} catch (e) {
  toast.error(e.message);
  load(); // full re-fetch to recover
}
```
This looked optimistic but recovery on failure meant a full board reload — jarring, and it discards any other local state.

**New** (`hooks/useTasks.tsx`):
```ts
export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();
  const boardKey = queryKeys.board(boardId);

  return useMutation({
    mutationFn: ({ id, column, order }) => tasksApi.update(id, { column, order }),
    onMutate: async ({ id, column, order }) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData(boardKey);
      queryClient.setQueryData(boardKey, (old) => /* update in place */ old);
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
    },
  });
}
```
On failure, this rolls back to the exact previous cache snapshot — no full re-fetch, no flash, no lost local state.

---

## 3. Drag-and-drop: native HTML5 DnD to dnd-kit

**Old:**
```jsx
<div draggable onDragStart={(e) => { dragTaskRef.current = task; }}>
```
Native HTML5 drag-and-drop has no keyboard support at all — a keyboard-only user simply cannot reorder a Kanban board built this way. It also has inconsistent drag-image/ghost behavior across browsers.

**New** (`features/tasks/TaskCard.tsx`):
```tsx
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
```
dnd-kit ships a `KeyboardSensor` (see `BoardDetailPage.tsx`) so the same board is fully operable via keyboard, plus a smooth animated `DragOverlay` and proper collision detection (`closestCorners`) instead of relying on browser-native drop-target quirks.

---

## 4. Auth: single token in a Context to access+refresh with an Axios interceptor

**Old:**
```js
const token = localStorage.getItem('taskflow_token');
if (token) headers.Authorization = `Bearer ${token}`;
```
The access token lived in `localStorage` for a week at a time (matching the old backend's 7-day JWT) — a bigger XSS blast radius, and no automatic recovery when it expired mid-session (the user just started getting 401s).

**New** (`api/axios.ts`):
```ts
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken(); // mutex-guarded
      if (newToken) return api(originalRequest); // transparently retried
    }
    return Promise.reject(error);
  }
);
```
The access token now only lives in memory (Zustand, not persisted), expires in 15 minutes, and a 401 triggers one silent refresh + retry — the user never sees it. A mutex (`refreshPromise`) means five simultaneous 401s only trigger one actual refresh call.

---

## 5. Forms: manual useState to React Hook Form + Zod

**Old** (`Login.jsx`):
```jsx
const [form, setForm] = useState({ email: '', password: '' });
const [error, setError] = useState('');
<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
```
No field-level validation before submit; errors were a single string for the whole form.

**New** (`features/auth/LoginForm.tsx`):
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
<Input error={errors.email?.message} {...register('email')} />
```
Validation runs against a typed Zod schema before the network call even fires, with per-field inline errors, and the same `FormField` wrapper is reused across every form in the app (login, register, task, board).

---

## 6. Component styling: copy-pasted classes to a real design system

**Old:** every "primary button" in the app was its own `className="btn-primary"` string defined once in a global CSS file — easy for a new button to drift from the pattern (wrong padding, wrong hover state) with no compiler help.

**New** (`components/ui/Button.tsx`):
```tsx
const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-xl font-semibold ...', {
  variants: {
    variant: { primary: '...', secondary: '...', ghost: '...', danger: '...', outline: '...' },
    size: { sm: '...', md: '...', lg: '...', icon: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```
`<Button variant="danger" size="sm">` is now a typed API — TypeScript rejects `variant="dangerous"` at compile time, and every button in the app is guaranteed to come from the same variant set.

---

## 7. Structure: flat pages to feature-based architecture

**Old:** `src/pages/BoardDetail.jsx` was around 350 lines mixing data fetching, drag state, modal state, and rendering for the entire Kanban board in one file.

**New:** `pages/BoardDetailPage.tsx` composes `features/tasks/{KanbanColumn,TaskCard,TaskModal}.tsx` and `hooks/useTasks.tsx` — each piece independently readable and testable. The page file itself is orchestration (which modal is open, which task is being dragged), not the Kanban rendering or the checklist/comments logic.
