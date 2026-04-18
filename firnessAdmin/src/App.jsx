import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart3 } from 'lucide-react';
import QuestionsPage from './pages/QuestionsPage';
import ResponsesPage from './pages/ResponsesPage';

const A = '#E8FF6B';
const BG = '#0e0e12';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: BG, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {/* Top nav bar */}
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
        </nav>
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<QuestionsPage />} />
            <Route path="/responses" element={<ResponsesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
