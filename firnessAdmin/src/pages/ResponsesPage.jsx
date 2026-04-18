import { useState, useEffect } from 'react';
import { Users, Percent, BarChart3, Search } from 'lucide-react';
import { fetchResponses } from '../api/questions';

const A = '#E8FF6B';
const C = { bg: '#0e0e12', card: '#1e1e26', border: '#2a2a34', text: '#ececf0', muted: '#6a6a7a' };

export default function ResponsesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResponses().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 24, color: C.muted }}>Loading...</div>;
  if (!data) return <div style={{ padding: 24, color: C.muted }}>Failed to load responses</div>;

  const filteredUsers = (data.users || []).filter(u =>
    !search || u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 20px' }}>Responses</h1>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard icon={<Users size={18} color={A} />} value={data.total_users} label="Total Users" />
        <StatCard icon={<Percent size={18} color={A} />} value={`${data.avg_completion}%`} label="Avg Completion" />
        <StatCard icon={<BarChart3 size={18} color={A} />} value={data.question_stats?.length || 0} label="Active Questions" />
      </div>

      {/* Per-question breakdown */}
      <div style={{ marginBottom: 24, padding: 16, background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, margin: '0 0 12px', letterSpacing: '.5px' }}>PER-QUESTION STATS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data.question_stats || []).map(q => {
            const pct = data.total_users > 0 ? Math.round((q.response_count / data.total_users) * 100) : 0;
            return (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 100, fontSize: 12, color: A, fontFamily: 'monospace', fontWeight: 600 }}>{q.step_id}</span>
                <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: A, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, color: C.muted, width: 60, textAlign: 'right' }}>{q.response_count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <Search size={14} color={C.muted} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by user ID..."
          style={{ flex: 1, fontSize: 13, background: 'transparent', border: 'none', color: C.text, outline: 'none' }}
        />
      </div>

      <div style={{ borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.card }}>
              {['User ID', 'Answered', 'Completion', 'Answers'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.user_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', color: C.text, fontFamily: 'monospace', fontSize: 11 }}>
                  {u.user_id.slice(0, 8)}...
                </td>
                <td style={{ padding: '10px 14px', color: C.text }}>
                  {u.answered} / {u.total}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${u.percent}%`, height: '100%', background: u.percent === 100 ? '#4ade80' : A, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: u.percent === 100 ? '#4ade80' : A, fontWeight: 600 }}>{u.percent}%</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {u.responses.map(r => (
                      <span key={r.id} style={{ padding: '2px 8px', borderRadius: 4, background: `${A}10`, color: A, fontSize: 10, fontWeight: 500 }}>
                        {r.question?.step_id}: {formatAnswer(r.answer)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
            {search ? 'No users match your search' : 'No responses yet'}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div style={{ padding: 16, background: '#1e1e26', borderRadius: 14, border: '1px solid #2a2a34', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#E8FF6B', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6a6a7a' }}>{label}</div>
    </div>
  );
}

function formatAnswer(answer) {
  if (Array.isArray(answer)) return answer.join(', ');
  if (typeof answer === 'object' && answer !== null) return JSON.stringify(answer);
  return String(answer);
}
