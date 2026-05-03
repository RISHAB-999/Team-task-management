import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Tasks     from './pages/Tasks';
import MyTasks   from './pages/MyTasks';
import Admin     from './pages/Admin';
import Teams     from './pages/Teams';
import Search    from './pages/Search';
import Profile   from './pages/Profile';
import Calendar  from './pages/Calendar';
import Timeline  from './pages/Timeline';

function AppShell() {
  const { toasts, toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const TITLES = { 
    '/': 'Dashboard', 
    '/dashboard': 'Dashboard',
    '/projects': 'Projects', 
    '/calendar': 'Calendar', 
    '/timeline': 'Timeline', 
    '/my-tasks': 'My Tasks', 
    '/teams': 'Teams', 
    '/admin': 'Admin', 
    '/search': 'Search', 
    '/settings': 'Settings' 
  };
  const title = TITLES[pathname] || (pathname.startsWith('/projects/') ? 'Project Board' : 'TaskFlow');

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <Routes>
          <Route path="/"              element={<Dashboard  toast={toast} />} />
          <Route path="/projects"      element={<Projects   toast={toast} />} />
          <Route path="/projects/:id"  element={<Tasks      toast={toast} />} />
          <Route path="/calendar"      element={<Calendar   toast={toast} />} />
          <Route path="/timeline"      element={<Timeline   toast={toast} />} />
          <Route path="/my-tasks"      element={<MyTasks    toast={toast} />} />
          <Route path="/teams"         element={<Teams      toast={toast} />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/settings"      element={<Profile    toast={toast} />} />
          <Route path="/admin"         element={<ProtectedRoute adminOnly><Admin toast={toast} /></ProtectedRoute>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*"     element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
