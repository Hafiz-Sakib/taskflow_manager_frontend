import { PRIORITY_META } from '../utils/helpers.js';

export default function PriorityBadge({ priority = 'medium' }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
  return (
    <span className={`badge ${meta.bg} ${meta.text}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}
