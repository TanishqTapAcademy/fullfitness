import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart3, Users, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import QuestionsPage from './pages/QuestionsPage';
import ResponsesPage from './pages/ResponsesPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';

const A = '#E8FF6B';
const BG = '#0e0e12';

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: BG, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: '#8e8e9e', fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: BG, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <nav style={{
          borderBottom: '1px solid #2a2a34', padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, height: 44,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutGrid size={13} color={BG} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Fitness Admin</span>
          </div>
          <NavLink to="/" end style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
            textDecoration: 'none', fontSize: 12, fontWeight: 600,
            background: isActive ? `${A}15` : 'transparent',
            color: isActive ? A : '#8e8e9e',
          })}>
            <LayoutGrid size={14} /> Builder
          </NavLink>
          <NavLink to="/responses" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
            textDecoration: 'none', fontSize: 12, fontWeight: 600,
            background: isActive ? `${A}15` : 'transparent',
            color: isActive ? A : '#8e8e9e',
          })}>
            <BarChart3 size={14} /> Responses
          </NavLink>
          <NavLink to="/users" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
            textDecoration: 'none', fontSize: 12, fontWeight: 600,
            background: isActive ? `${A}15` : 'transparent',
            color: isActive ? A : '#8e8e9e',
          })}>
            <Users size={14} /> Users
          </NavLink>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#8e8e9e', fontSize: 11, marginRight: 8 }}>{user.email}</span>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              borderRadius: 6, border: '1px solid #2a2a34', background: 'transparent',
              color: '#8e8e9e', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <LogOut size={12} /> Logout
          </button>
        </nav>
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<QuestionsPage />} />
            <Route path="/responses" element={<ResponsesPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
