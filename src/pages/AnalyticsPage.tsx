import { Topbar } from '@/components/layout/Topbar';
import { PageTransition } from '@/components/common/PageTransition';
import { Spinner } from '@/components/ui/Spinner';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useBoards } from '@/hooks/useBoards';

const PRIORITY_COLORS: Record<string, string> = { low: '#28c281', medium: '#f5a15c', high: '#ef4d6b' };

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: boards } = useBoards();

  if (isLoading || !stats) {
    return (
      <div>
        <Topbar title="Analytics" />
        <Spinner full />
      </div>
    );
  }

  const columnEntries = Object.entries(stats.tasksByColumn);
  const priorityEntries = Object.entries(stats.tasksByPriority);
  const total = stats.totalTasks;

  return (
    <div>
      <Topbar title="Analytics" />
      <PageTransition>
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <MetricCard label="Total tasks" value={total} />
            <MetricCard label="Completion rate" value={`${stats.completionRate}%`} accent="text-success" />
            <MetricCard label="Overdue" value={stats.overdueCount} accent="text-danger" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
              <h2 className="font-bold mb-4">Tasks by column</h2>
              <BarChart data={columnEntries.map(([label, value]) => ({ label, value }))} />
            </div>

            <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
              <h2 className="font-bold mb-4">Tasks by priority</h2>
              <div className="flex items-center gap-8">
                <DonutChart
                  segments={priorityEntries.map(([key, value]) => ({ value, color: PRIORITY_COLORS[key] || '#8b8ba7' }))}
                  total={total}
                />
                <div className="space-y-2.5">
                  {priorityEntries.map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIORITY_COLORS[key] }} />
                      <span className="capitalize font-medium">{key}</span>
                      <span className="text-ink-400">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
            <h2 className="font-bold mb-4">Boards</h2>
            <p className="text-sm text-ink-400">
              You have {stats.boardCount} board{stats.boardCount === 1 ? '' : 's'} with {total} total task
              {total === 1 ? '' : 's'}.
            </p>
            {boards && boards.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {boards.map((b) => (
                  <li key={b._id} className="text-sm text-ink-600 dark:text-ink-300">
                    {b.title} — {b.columns.length} columns
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-ink-900 shadow-soft p-5">
      <p className={`text-3xl font-bold ${accent || ''}`}>{value}</p>
      <p className="text-sm text-ink-400 mt-1">{label}</p>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
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
          <span className="text-xs text-ink-400 text-center truncate w-full">{d.label}</span>
          <span className="text-xs font-semibold -mt-1">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { value: number; color: string }[]; total: number }) {
  const size = 120;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-ink-100 dark:text-ink-800"
        strokeWidth={stroke}
      />
      {total > 0 &&
        segments.map((s, i) => {
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
