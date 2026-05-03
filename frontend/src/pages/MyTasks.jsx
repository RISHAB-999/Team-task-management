import { useEffect, useState } from 'react';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

export default function MyTasks({ toast }) {
  const { user } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', priority:'', search:'' });

  useEffect(() => {
    const params = {};
    if (filters.status)   params.status   = filters.status;
    if (filters.priority) params.priority  = filters.priority;
    if (filters.search)   params.search    = filters.search;
    setLoading(true);
    api.get('/tasks/my', { params }).then(r => { setTasks(r.data.tasks); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  async function handleStatusChange(taskId, status) {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(ts => ts.map(t => t.id === taskId ? data.task : t));
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
  }

  return (
    <div className="page">
      <div className="page-header"><h1>My Tasks</h1></div>

      <div className="filters">
        <input className="search-input" placeholder="🔍 Search tasks..." value={filters.search}
          onChange={e => setFilters(p => ({...p, search:e.target.value}))} />
        <select className="filter-select" value={filters.status} onChange={e => setFilters(p => ({...p, status:e.target.value}))}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters(p => ({...p, priority:e.target.value}))}>
          <option value="">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        {(filters.status||filters.priority||filters.search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status:'', priority:'', search:'' })}>✕ Clear</button>
        )}
        <span style={{ marginLeft:'auto', fontSize:13, color:'var(--text-2)' }}>{tasks.length} tasks</span>
      </div>

      {loading ? (
        <div style={{color:'var(--text-2)'}}>Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state"><div className="icon">✅</div><h3>No tasks found</h3><p>Adjust filters or wait for assignments</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:12 }}>
          {tasks.map(t => (
            <div key={t.id}>
              <div style={{ fontSize:11, color:'var(--text-2)', marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color: t.project_color }}>●</span>
                {t.project_name}
              </div>
              <TaskCard task={t} onStatusChange={handleStatusChange} highlightStatus={true} currentUserId={user.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
