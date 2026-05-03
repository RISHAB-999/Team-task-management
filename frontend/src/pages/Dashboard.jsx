import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function TopStatCard({ title, value, accent, badgeText, badgeIcon }) {
  return (
    <div className="card" style={{ 
      padding: '24px', 
      position: 'relative', 
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      zIndex: 1,
      border: '1px solid rgba(255,255,255,0.08)'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.borderColor = accent;
      e.currentTarget.style.boxShadow = `0 0 25px -5px ${accent}, 0 20px 60px -10px ${accent}88`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
            {title}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {value ?? 0}
          </div>
        </div>
        
        {badgeText && (
          <div style={{ 
            background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', 
            padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 
          }}>
            {badgeText}
          </div>
        )}
        
        {badgeIcon && (
          <div style={{ 
            width: 24, height: 24, borderRadius: '50%', 
            border: `1px solid ${accent}`, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700
          }}>
            {badgeIcon}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  const progress = project.task_count > 0 ? Math.round((project.done_count / project.task_count) * 100) : 0;
  const avatars = project.members?.slice(0, 4) || [];
  const extraMembers = Math.max(0, (project.member_count || 0) - avatars.length);

  return (
    <div 
      onClick={onClick}
      className="card"
      style={{
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        border: '1px solid rgba(255,255,255,0.08)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = project.color || 'var(--accent)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 0 20px -5px ${project.color || 'var(--primary)'}, 0 15px 45px -10px ${project.color || 'var(--primary-glow)'}88`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: Dot + Title + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color || 'var(--primary)', boxShadow: `0 0 10px ${project.color || 'var(--primary)'}` }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>{project.name}</div>
        </div>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          {project.status || 'Active'}
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, minHeight: 40 }}>
        {project.description || 'No description provided for this workspace project.'}
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', width: '100%' }} />

      {/* Progress Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>
            <span style={{ color: '#fff' }}>{project.done_count}/{project.task_count}</span> tasks completed
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: project.color || 'var(--primary)' }}>{progress}%</div>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${project.color || 'var(--primary)'}, ${project.color || 'var(--accent)'})`,
            width: `${progress}%`,
            borderRadius: 20,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 15px ${project.color || 'var(--primary-glow)'}`
          }} />
        </div>
      </div>

      {/* Footer: Avatars + Member Count + Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {avatars.map((m, i) => (
              <div key={m.id} style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: m.avatar_color || '#333',
                border: '2px solid #0d0d15',
                marginLeft: i === 0 ? 0 : -10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 4 - i
              }}>
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{m.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            ))}
            {extraMembers > 0 && (
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#1a1a2e',
                border: '2px solid #0d0d15',
                marginLeft: -10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: '#8b5cf6',
                zIndex: 0
              }}>
                +{extraMembers}
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{project.member_count || 0} members</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
          {new Date(project.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks/dashboard/stats'),
      api.get('/projects')
    ]).then(([statsRes, projectsRes]) => {
      setStats(statsRes.data);
      setProjects(projectsRes.data.projects || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div style={{color:'var(--text-2)', display: 'flex', justifyContent: 'center', marginTop: 40}}><span className="spinner" style={{width: 32, height: 32}} /></div></div>;

  const s = stats?.taskStats || {};
  const pending = (s.todo || 0) + (s.in_progress || 0);
  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 3);
  const completionPct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;

  return (
    <div className="page" style={{ maxWidth: '100%', padding: '40px 40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Workspace Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 20, color: 'var(--text-2)', fontSize: 14, fontWeight: 500 }}>
            <span style={{ color: 'var(--text)', borderBottom: '2px solid var(--accent)', paddingBottom: 4, cursor: 'pointer' }} onClick={() => navigate('/')}>Tasks</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/timeline')} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}>Timeline</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/calendar')} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}>Calendar</span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <TopStatCard title="Total Tasks" value={s.total} accent="#6366f1" badgeText={`${completionPct}%`} />
        <TopStatCard title="Completed" value={s.done} accent="#10b981" badgeIcon="✓" />
        <TopStatCard title="Pending" value={pending} accent="#f59e0b" badgeIcon="●" />
        <TopStatCard title="Overdue" value={s.overdue} accent="#ef4444" badgeIcon="⚠" />
      </div>

      {/* Active Projects Section */}
      {activeProjects.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Active Projects</h2>
            <span style={{ color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }} onClick={() => navigate('/projects')}>View Archive →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {activeProjects.map(project => (
              <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Left Column: Recent Tasks */}
        <div className="card" 
          style={{ 
            padding: '24px 28px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 20px -5px var(--primary), 0 20px 50px -15px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Tasks</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }}>⚙</div>
              <div style={{ color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }}>⋮</div>
            </div>
          </div>
          
          <div style={{ width: '100%' }}>
            {/* Table Header */}
            <div style={{ 
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, 
              paddingBottom: 12, borderBottom: '1px solid var(--border)', 
              fontSize: 11, fontWeight: 600, color: 'var(--text-2)', letterSpacing: 1, textTransform: 'uppercase' 
            }}>
              <div>Task Name</div>
              <div>Assignee</div>
              <div>Priority</div>
              <div>Status</div>
            </div>

            {/* Table Body */}
            {stats?.recentTasks?.length ? stats.recentTasks.slice(0, 6).map(t => (
              <div key={t.id}
                style={{ 
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, 
                  padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  cursor: 'pointer', alignItems: 'center', transition: 'background 0.2s',
                  fontSize: 13
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                onClick={() => navigate(`/projects/${t.project_id}`)}
              >
                <div style={{ fontWeight: 500, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.title}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.assignee ? (
                    <>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: '50%', 
                        background: t.assignee?.avatar_color || 'var(--primary)', 
                        color: '#fff', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: 10, fontWeight: 700,
                        overflow: 'hidden'
                      }}>
                        {t.assignee?.avatar_url ? (
                          <img src={t.assignee.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          t.assignee?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <span style={{ color: 'var(--text-2)' }}>{t.assignee.name}</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Unassigned</span>
                  )}
                </div>
                
                <div>
                  {t.priority === 'high' ? (
                    <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>High</span>
                  ) : t.priority === 'medium' ? (
                    <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Medium</span>
                  ) : (
                    <span style={{ background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-2)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Low</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ 
                    width: 6, height: 6, borderRadius: '50%', 
                    background: t.status === 'done' ? 'var(--success)' : t.status === 'in_progress' ? 'var(--accent)' : 'var(--text-2)' 
                  }} />
                  <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-2)' }}>No recent tasks</div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines */}
        <div className="card" 
          style={{ 
            padding: '24px 28px', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 20px -5px var(--primary), 0 20px 50px -15px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Deadlines</h2>
            <div style={{ color: 'var(--text-2)', cursor: 'pointer', letterSpacing: 2 }}>⋮</div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Overdue Section */}
            {stats?.overdueTasks?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔴 {stats.overdueTasks.length} OVERDUE TASK{stats.overdueTasks.length > 1 ? 'S' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.overdueTasks.map(t => {
                    const daysLate = Math.floor((new Date() - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate(`/projects/${t.project_id}`)}>
                        <div style={{ fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          {t.title}
                        </div>
                        <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>
                          ⊘ {daysLate}d late
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {stats?.upcomingTasks?.length > 0 ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  📌 UPCOMING DEADLINES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.upcomingTasks.slice(0, 3).map(t => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const due = new Date(t.due_date);
                    due.setHours(0,0,0,0);
                    const diffTime = due - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    let dateStr = '';
                    if (diffDays === 0) {
                      dateStr = 'Today';
                    } else if (diffDays === 1) {
                      dateStr = 'Tomorrow';
                    } else {
                      dateStr = `In ${diffDays}d`;
                    }

                    return (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate(`/projects/${t.project_id}`)}>
                        <div style={{ fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          {t.title}
                        </div>
                        <div style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 600 }}>
                          {dateStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Empty State */}
            {(!stats?.overdueTasks?.length && !stats?.upcomingTasks?.length) && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>You're all caught up!</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>No deadlines</div>
              </div>
            )}
            
          </div>

          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 24, padding: '12px', background: 'rgba(255,255,255,0.03)' }} onClick={() => navigate('/calendar')}>
            Full Schedule
          </button>
        </div>

      </div>
    </div>
  );
}
