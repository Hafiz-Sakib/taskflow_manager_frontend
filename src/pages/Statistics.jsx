import { useEffect, useState } from 'react';
import { boardsApi } from '../api/client.js';
import BottomNav from '../components/BottomNav.jsx';

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SAMPLE_TREND = [8, 14, 12, 16, 15, 23, 18];

const TEAMS = [
  { label: 'Design', pct: 40, color: '#3b6cf6' },
  { label: 'Marketing', pct: 30, color: '#b13bde' },
  { label: 'Dev', pct: 30, color: '#ef4d8b' },
];

export default function Statistics() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    boardsApi.list().then(setBoards).catch(() => {});
  }, []);

  const pending = boards[0];

  return (
    <div className="app-shell">
      <div className="screen">
        <h1 className="stats-title">Task Completion</h1>

        <div className="card chart-card">
          <TrendChart data={SAMPLE_TREND} labels={WEEK} />
        </div>

        <h2 className="section-title">Teams</h2>
        <div className="card teams-card">
          <div className="team-bar">
            {TEAMS.map((t) => (
              <span key={t.label} style={{ width: `${t.pct}%`, background: t.color }} />
            ))}
          </div>
          <div className="team-legend">
            {TEAMS.map((t) => (
              <div key={t.label} className="team-legend__item">
                <span className="dot" style={{ background: t.color }} />
                <strong>{t.pct}%</strong>
                <span className="muted">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="section-title">Pending</h2>
        <div className="card pending-card">
          <div className="pending-card__top">
            <p className="pending-card__title">{pending?.title || 'Web design project'}</p>
            <button className="hero-card__menu" style={{ color: 'var(--ink-faint)' }}>⋮</button>
          </div>
          <div className="pending-card__progress-row">
            <span>Progress</span>
            <span>{pending?.progress ?? 32}%</span>
          </div>
          <div className="pending-card__bar">
            <div className="pending-card__bar-fill" style={{ width: `${pending?.progress ?? 32}%` }} />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function TrendChart({ data, labels }) {
  const width = 320;
  const height = 140;
  const max = Math.max(...data) + 5;
  const min = 0;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / (max - min)) * height;
    return [x, y];
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(' ');

  const peakIndex = data.indexOf(Math.max(...data));
  const peak = points[peakIndex];

  return (
    <svg viewBox={`0 0 ${width} ${height + 26}`} width="100%" height="180">
      <path d={path} fill="none" stroke="#3b6cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={peak[0]} cy={peak[1]} r="4" fill="#3b6cf6" />
      <rect x={peak[0] - 14} y={peak[1] - 26} width="28" height="18" rx="6" fill="#3b6cf6" />
      <text x={peak[0]} y={peak[1] - 13} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">
        {data[peakIndex]}
      </text>
      {labels.map((l, i) => (
        <text key={l} x={i * stepX} y={height + 20} textAnchor="middle" fontSize="10" fill="#a0a3bd">
          {l}
        </text>
      ))}
    </svg>
  );
}
