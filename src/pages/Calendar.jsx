import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import Spinner from '../components/Spinner.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { boardsApi } from '../api/client.js';
import { sameDay, formatDate } from '../utils/helpers.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { openMobileNav, openSearch } = useOutletContext() || {};
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    let cancelled = false;
    boardsApi
      .list()
      .then(async (boards) => {
        const details = await Promise.all(boards.map((b) => boardsApi.get(b._id).catch(() => null)));
        if (cancelled) return;
        const withDates = details
          .filter(Boolean)
          .flatMap((d) => d.tasks.map((t) => ({ ...t, boardTitle: d.board.title })))
          .filter((t) => t.dueDate);
        setTasks(withDates);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const cells = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const tasksForDay = (day) => tasks.filter((t) => sameDay(new Date(t.dueDate), day));
  const selectedTasks = tasksForDay(selectedDay);

  const goMonth = (delta) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  return (
    <div>
      <Topbar title="Calendar" onMenuClick={openMobileNav} onSearchClick={openSearch} />

      <div className="px-4 sm:px-6 py-6">
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">
                  {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => goMonth(-1)} className="rounded-lg p-2 hover:bg-ink-50 dark:hover:bg-ink-800">
                    ‹
                  </button>
                  <button onClick={() => setCursor(new Date())} className="btn-ghost text-xs px-3 py-1.5">
                    Today
                  </button>
                  <button onClick={() => goMonth(1)} className="rounded-lg p-2 hover:bg-ink-50 dark:hover:bg-ink-800">
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-xs font-semibold text-ink-400 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, i) => {
                  const dayTasks = day ? tasksForDay(day) : [];
                  const isSelected = day && sameDay(day, selectedDay);
                  const isToday = day && sameDay(day, new Date());
                  return (
                    <button
                      key={i}
                      disabled={!day}
                      onClick={() => day && setSelectedDay(day)}
                      className={`aspect-square rounded-xl p-1.5 text-left text-xs transition-colors flex flex-col ${
                        !day
                          ? 'invisible'
                          : isSelected
                          ? 'bg-brand-500 text-white'
                          : isToday
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                          : 'hover:bg-ink-50 dark:hover:bg-ink-800'
                      }`}
                    >
                      <span className="font-semibold">{day?.getDate()}</span>
                      {dayTasks.length > 0 && (
                        <span className="mt-auto flex gap-0.5 flex-wrap">
                          {dayTasks.slice(0, 3).map((t) => (
                            <span
                              key={t._id}
                              className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-bold mb-3">{formatDate(selectedDay.toISOString())}</h2>
              <div className="card divide-y divide-ink-100 dark:divide-ink-800">
                {selectedTasks.length === 0 && <p className="text-sm text-ink-400 p-4">No tasks due this day.</p>}
                {selectedTasks.map((t) => (
                  <div key={t._id} className="p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="text-xs text-ink-400">
                      {t.boardTitle} · {t.column}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildMonthGrid(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const cells = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
