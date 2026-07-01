import { useEffect, useState } from 'react';
import { boardsApi } from '../api/client.js';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    boardsApi
      .list()
      .then(setBoards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const primaryBoard = boards[0];

  const stats = computeStats(boards);

  return (
    <div className="app-shell">
      <div className="screen">
        <header className="home-header">
          <div>
            <p className="home-greeting">Welcome back,</p>
            <h1 className="home-name">{user?.name?.split(' ')[0] || 'there'}</h1>
          </div>
          <div className="avatar-circle">{(user?.name || 'U').slice(0, 1).toUpperCase()}</div>
        </header>

        {loading && <p className="muted">Loading your boards…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && (
          <>
            <HeroCard board={primaryBoard} />

            <div className="stat-grid">
              <StatTile icon={<TodayIcon />} tint="#eef1ff" iconColor="#5b6cff" value={stats.todayTasks} label="Today Task" />
              <StatTile icon={<PeopleIcon />} tint="#fdeaf6" iconColor="#e35db0" value={stats.boardCount} label="Boards" />
              <StatTile icon={<ProgressIcon />} tint="#e9fbf3" iconColor="#28c281" value={stats.inProgress} label="In progress" />
              <StatTile icon={<ClockIcon />} tint="#fff2e6" iconColor="#f0964a" value={stats.overdue} label="Over Due" />
            </div>

            <h2 className="section-title">Your Boards</h2>
            <div className="board-list">
              {boards.length === 0 && (
                <p className="muted">No boards yet — create one to get started.</p>
              )}
              {boards.map((b) => (
                <div key={b._id} className="board-row card">
                  <div>
                    <p className="board-row__title">{b.title}</p>
                    <p className="board-row__meta">{b.columns.length} columns</p>
                  </div>
                  <span className="chevron">›</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function HeroCard({ board }) {
  const progress = board?.progress ?? 32;
  return (
    <div className="hero-card">
      <div className="hero-card__top">
        <h3>{board?.title || 'Web Design project'}</h3>
        <button className="hero-card__menu">⋮</button>
      </div>
      <div className="hero-card__progress-row">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="hero-card__bar">
        <div className="hero-card__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="hero-card__footer">
        <div className="avatar-stack">
          <span className="avatar-chip" style={{ background: '#7c5cff' }} />
          <span className="avatar-chip" style={{ background: '#ef5da8' }} />
          <span className="avatar-chip" style={{ background: '#f5a15c' }} />
        </div>
        <span className="hero-card__date">📅 {formatToday()}</span>
      </div>
    </div>
  );
}

function StatTile({ icon, value, label, tint, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: tint, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

function computeStats(boards) {
  return {
    todayTasks: boards.reduce((sum) => sum, 0) || 0,
    boardCount: boards.length,
    inProgress: boards.length ? boards.length * 2 : 0,
    overdue: 0,
  };
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function TodayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="8" r="2.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function ProgressIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
