import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',          label: 'Dashboard', icon: '▦' },
  { to: '/projects',  label: 'Projects',  icon: '▤' },
  { to: '/my-tasks',  label: 'My Tasks',  icon: '✓' },
  { to: '/teams',     label: 'Teams',     icon: '👥' },
  { to: '/search',    label: 'Search',    icon: '🔍' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <>
      {isOpen && <div style={{ position:'fixed',inset:0,background:'var(--overlay)',zIndex:49 }} onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2.5" fill="white"/>
              <rect x="16" y="2" width="10" height="10" rx="2.5" fill="white" opacity="0.7"/>
              <rect x="2" y="16" width="10" height="10" rx="2.5" fill="white" opacity="0.7"/>
              <rect x="16" y="16" width="10" height="10" rx="2.5" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <span className="brand-name">TaskFlow</span>
        </div>

        <span className="nav-section">Menu</span>
        <nav style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to==='/'} onClick={onClose}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span style={{ fontSize:15 }}>{icon}</span>{label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={onClose}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span style={{ fontSize:15 }}>🛡️</span>Admin
            </NavLink>
          )}
        </nav>

        <span className="nav-section" style={{ marginTop:16 }}>Account</span>
        <NavLink to="/settings" onClick={onClose}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span style={{ fontSize:15 }}>⚙️</span>Settings
        </NavLink>

        <div className="sidebar-footer">
          <div className="user-chip" style={{ cursor:'pointer' }} onClick={() => { navigate('/settings'); onClose?.(); }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="avatar" style={{ width:32,height:32,borderRadius:'50%',objectFit:'cover' }} />
              : <div className="avatar" style={{ background: user?.avatar_color||'var(--primary)' }}>{initials}</div>
            }
            <div className="user-chip-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
