import { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAdminUsers, createAdminUser, deleteAdminUser } from '../api/auth';

const A = '#E8FF6B';
const C = { bg: '#0e0e12', card: '#1e1e26', border: '#2a2a34', text: '#ececf0', muted: '#6a6a7a' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = () => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createAdminUser(email, password);
      setEmail('');
      setPassword('');
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, userEmail) => {
    if (!confirm(`Delete admin "${userEmail}"?`)) return;
    try {
      await deleteAdminUser(id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 24, color: C.muted }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Admin Users</h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 8, border: 'none', background: A, color: C.bg,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <UserPlus size={14} /> Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{
          marginBottom: 20, padding: 16, background: C.card, borderRadius: 14,
          border: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 }}>
            <label style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 }}>
            <label style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none',
              }}
            />
          </div>
          <button
            type="submit" disabled={submitting}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', background: A,
              color: C.bg, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? '...' : 'Create'}
          </button>
          {error && <div style={{ width: '100%', color: '#ff6b6b', fontSize: 12 }}>{error}</div>}
        </form>
      )}

      <div style={{ borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.card }}>
              {['Email', 'Role', 'Created', ''].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', color: C.muted,
                  fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${C.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', color: C.text }}>
                  {u.email}
                  {u.id === currentUser?.id && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: A, fontWeight: 600 }}>YOU</span>
                  )}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, background: `${A}15`,
                    color: A, fontSize: 11, fontWeight: 600,
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '10px 14px', color: C.muted, fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                        borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent',
                        color: '#ff6b6b', fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
            No admin users found
          </div>
        )}
      </div>
    </div>
  );
}
