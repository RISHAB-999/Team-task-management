import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { COLORS } from '../utils/colors';

function ProjectCard({ project, onClick }) {
  const pct = project.task_count > 0 ? Math.round((project.done_count / project.task_count) * 100) : 0;
  const avatars = project.members?.slice(0, 4) || [];
  const extraMembers = Math.max(0, (project.member_count || 0) - avatars.length);

  return (
    <div 
      className="card" 
      onClick={() => onClick(project)}
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
          <div style={{ fontSize: 14, fontWeight: 700, color: project.color || 'var(--primary)' }}>{pct}%</div>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${project.color || 'var(--primary)'}, ${project.color || 'var(--accent)'})`,
            width: `${pct}%`,
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

export default function Projects({ toast }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', color: COLORS.avatarColors[0], team_id:'' });
  const [saving, setSaving] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);

  useEffect(() => {
    api.get('/projects').then(r => { setProjects(r.data.projects); setLoading(false); }).catch(() => setLoading(false));
    if (user?.role === 'admin') {
      api.get('/teams').then(r => setAvailableTeams(r.data.teams)).catch(()=>{});
    }
  }, [user?.role]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.team_id) delete payload.team_id;
      const { data } = await api.post('/projects', payload);
      setProjects(p => [data.project, ...p]);
      setShowModal(false);
      setForm({ name:'', description:'', color: COLORS.avatarColors[0], team_id:'' });
      toast?.success('Project created!');
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to create project');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="page"><div style={{color:'var(--text-2)'}}>Loading…</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Projects</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />)}
        </div>
      )}

      {showModal && user?.role === 'admin' && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Project Name *</label>
              <input type="text" placeholder="e.g. Website Redesign" value={form.name}
                onChange={e => setForm(p => ({...p, name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="What is this project about?" rows={3} value={form.description}
                onChange={e => setForm(p => ({...p, description:e.target.value}))} />
            </div>
            
            {user?.role === 'admin' && availableTeams.length > 0 && (
              <div className="form-group">
                <label>Assign to Team <small style={{color:'var(--text-3)'}}>(Optional)</small></label>
                <select value={form.team_id} onChange={e => setForm(p => ({...p, team_id:e.target.value}))}>
                  <option value="">No Team (Standalone Project)</option>
                  {availableTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Color</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {COLORS.avatarColors.map(c => (
                  <div key={c} onClick={() => setForm(p => ({...p, color:c}))}
                    style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                      outline: form.color===c ? `3px solid ${c}` : 'none', outlineOffset:2, transition:'all 0.15s' }}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner"/> : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
