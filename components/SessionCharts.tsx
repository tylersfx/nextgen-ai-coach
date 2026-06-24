'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from 'recharts';

interface Shot {
  club: string;
  club_speed: number | null;
  ball_speed: number | null;
  smash_factor: number | null;
  carry: number | null;
  offline: number | null;
}

interface SessionSummary {
  id: string;
  started_at: string;
  summary: any;
}

interface SessionChartsProps {
  sessions: SessionSummary[];
  shots?: Shot[];
}

const getClubColor = (club: string): string => {
  const lower = club.toLowerCase();
  if (lower.includes('driver') || lower.includes('wood')) return '#22c55e';
  if (lower.includes('hybrid')) return '#eab308';
  if (lower.includes('iron') || /\d/.test(club)) return '#3b82f6';
  if (lower.includes('wedge')) return '#f97316';
  if (lower.includes('putter')) return '#a1a1aa';
  return '#8b5cf6';
};

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export default function SessionCharts({ sessions, shots = [] }: SessionChartsProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white/5 rounded-2xl p-8 text-center">
        <p className="text-white/70">No session data yet. Your charts will appear automatically after playing sessions.</p>
      </div>
    );
  }

  // Line Chart Data
  const lineData = [...sessions]
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .slice(-10)
    .map((session, index) => ({
      session: `S${index + 1}`,
      clubSpeed: session.summary?.avg_club_speed || 0,
    }));

  // Bar Chart Data
  const clubData = React.useMemo(() => {
    if (!shots.length) return [];
    const map = new Map<string, { total: number; count: number }>();

    shots.forEach(shot => {
      if (shot.club && shot.club_speed) {
        const current = map.get(shot.club) || { total: 0, count: 0 };
        current.total += shot.club_speed;
        current.count += 1;
        map.set(shot.club, current);
      }
    });

    return Array.from(map.entries())
      .map(([club, data]) => ({
        club,
        avgClubSpeed: Math.round((data.total / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.avgClubSpeed - a.avgClubSpeed)
      .slice(0, 8);
  }, [shots]);

  // Group shots by club for scatter + ellipses
  const shotsByClub = React.useMemo(() => {
    const grouped = new Map<string, any[]>();
    shots
      .filter(s => s.carry !== null && s.offline !== null)
      .forEach(shot => {
        if (!grouped.has(shot.club)) grouped.set(shot.club, []);
        grouped.get(shot.club)!.push(shot);
      });
    return Array.from(grouped.entries());
  }, [shots]);

  return (
    <div className="space-y-8">
      {/* Club Speed Trend */}
      <div className="bg-white/5 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Club Speed Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
              <XAxis dataKey="session" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="clubSpeed" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Club by Club Bar Chart */}
      {clubData.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Average Club Speed by Club</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clubData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="club" stroke="#ffffff50" />
                <YAxis stroke="#ffffff50" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="avgClubSpeed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Dispersion Scatter Plot with Club Colors */}
      {shotsByClub.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Dispersion by Club</h3>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis type="number" dataKey="carry" name="Carry" stroke="#ffffff50" />
                <YAxis type="number" dataKey="offline" name="Offline" stroke="#ffffff50" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }} />

                {shotsByClub.map(([club, clubShots], index) => (
                  <Scatter
                    key={index}
                    name={club}
                    data={clubShots.map((s: any) => ({ carry: s.carry, offline: s.offline }))}
                    fill={getClubColor(club)}
                    opacity={0.7}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}