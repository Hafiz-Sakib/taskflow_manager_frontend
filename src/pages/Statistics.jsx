import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import Spinner from '../components/Spinner.jsx';
import { boardsApi } from '../api/client.js';
import { isOverdue, isDoneColumn } from '../utils/helpers.js';

const PRIORITY_COLORS = { low: '#28c281', medium: '#f5a15c', high: '#ef4d6b' };

export default function Statistics() {
  const { openMobileNav, openSearch } = useOutletContext() || {};
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    boardsApi
      .list()
      .then(async (boardList) => {
        setBoards(boardList);
        const details = await Promise.all(boardList.map((b) => boardsApi.get(b._id).catch(() => null)));
        if (cancelled) return;
        setTasks(details.filter(Boolean).flatMap((d) => d.tasks.map((t) => ({ ...t, boardTitle: d.board.title }))));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <Topbar title="Statistics" onMenuClick={openMobileNav} onSearchClick={openSearch} />
        <Spinner />
      </div>
    );
  }

  const total = tasks.length;
  const byPriority = ['low', 'medium', 'high'].map((p) => ({
    key: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));
  const columns = [...new Set(tasks.map((t) => t.column))];
  const byColumn = columns.map((c) => ({ column: c, count: tasks.filter((t) => t.column === c).length }));
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.column)).length;
  const doneCount = tasks.filter((t) => isDoneColumn(t.column)).length;
  const completionRate = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div>
      <Topbar title="Statistics" onMenuClick={openMobileNav} onSearchClick={openSearch} />

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <MetricCard label="Total tasks" value={total} />
          <MetricCard label="Completion rate" value={`${completionRate}%`} accent="text-priority-low" />
          <MetricCard label="Overdue" value={overdueCount} accent="text-priority-high" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="font-bold mb-4">Tasks by column</h2>
            <BarChart data={byColumn.map((c) => ({ label: c.column, value: c.count }))} />
          </div>

          <div className="card p-5">
            <h2 className="font-bold mb-4">Tasks by priority</h2>
            <div className="flex items-center gap-8">
              <DonutChart
                segments={byPriority.map((p) => ({ value: p.count, color: PRIORITY_COLORS[p.key] }))}
                total={total}
              />
              <div className="space-y-2.5">
                {byPriority.map((p) => (
                  <div key={p.key} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIORITY_COLORS[p.key] }} />
                    <span className="capitalize font-medium">{p.key}</span>
                    <span className="text-ink-400">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4">Progress by board</h2>
          <div className="space-y-4">
            {boards.map((b) => {
              const boardTasks = tasks.filter((t) => t.boardTitle === b.title);
              const done = boardTasks.filter((t) => t.column.toLowerCase() === 'done').length;
              const pct = boardTasks.length ? Math.round((done / boardTasks.length) * 100) : 0;
              return (
                <div key={b._id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{b.title}</span>
                    <span className="text-ink-400">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {boards.length === 0 && <p className="text-sm text-ink-400">No boards yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent = 'text-ink-900 dark:text-white' }) {
  return (
    <div className="card p-5">
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      <p className="text-sm text-ink-400 mt-1">{label}</p>
    </div>
  );
}

function BarChart({ data }) {
  if (data.length === 0) return <p className="text-sm text-ink-400">No data yet.</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-4 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-lg bg-brand-500/80"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 6 : 2 }}
            />
          </div>
          <span className="text-xs text-ink-400 text-center">{d.label}</span>
          <span className="text-xs font-semibold -mt-1">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, total }) {
  const size = 120;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-ink-100 dark:text-ink-800" strokeWidth={stroke} />
      {total === 0
        ? null
        : segments.map((s, i) => {
            const fraction = s.value / total;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-lg font-bold">
        {total}
      </text>
    </svg>
  );
}
