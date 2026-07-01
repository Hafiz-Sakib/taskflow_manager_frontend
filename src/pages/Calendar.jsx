import { useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1am - 12pm block shown

const SAMPLE_EVENTS = [
  { day: 0, hour: 1, title: 'Design Standup', color: '#8b6fe8' },
  { day: 1, hour: 2, title: 'Dev Meet Up', color: '#3b6cf6' },
  { day: 0, hour: 4, title: 'Design Review', color: '#c14fc4' },
  { day: 2, hour: 5, title: 'Design Review', color: '#b13bde' },
  { day: 0, hour: 7, title: 'Design Standup', color: '#8b6fe8' },
];

export default function CalendarPage() {
  const days = useMemo(() => buildWeek(), []);
  const [selected, setSelected] = useState(days[2].dateNum);

  return (
    <div className="app-shell">
      <div className="screen cal-screen">
        <header className="cal-header">
          <button className="icon-btn">‹</button>
          <button className="icon-btn">⋮</button>
        </header>

        <h1 className="cal-title">Your calendar</h1>

        <div className="cal-strip">
          {days.map((d) => (
            <button
              key={d.dateNum}
              className={`cal-chip ${selected === d.dateNum ? 'cal-chip--active' : ''}`}
              onClick={() => setSelected(d.dateNum)}
            >
              <span className="cal-chip__num">{d.dateNum}</span>
              <span className="cal-chip__label">{d.label}</span>
              {selected === d.dateNum && <span className="cal-chip__dot" />}
            </button>
          ))}
        </div>

        <div className="cal-grid card">
          <div className="cal-grid__days">
            <span className="cal-gmt">GMT+6</span>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="cal-grid__body">
            {HOURS.map((h) => (
              <div className="cal-row" key={h}>
                <span className="cal-row__hour">{h <= 12 ? `${h} am` : `${h - 12} pm`}</span>
                <div className="cal-row__track">
                  {SAMPLE_EVENTS.filter((e) => e.hour === h).map((e, idx) => (
                    <span
                      key={idx}
                      className="cal-event"
                      style={{ background: e.color, left: `${e.day * 22}%` }}
                    >
                      {e.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function buildWeek() {
  const labels = ['Sat', 'Sun', 'Mon', 'Tues', 'wed', 'Thus'];
  const start = 17;
  return labels.map((label, i) => ({ dateNum: start + i, label }));
}
