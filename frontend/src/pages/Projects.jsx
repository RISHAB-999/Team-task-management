import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { COLORS } from '../utils/colors';

function ProjectCard({ project, onClick, onDelete, isAdmin }) {
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
      {/* Header: Dot + Title + Status + Delete Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color || 'var(--primary)', boxShadow: `0 0 10px ${project.color || 'var(--primary)'}` }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>{project.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            whiteSpace: 'nowrap'
          }}>
            {project.status || 'Active'}
          </div>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 8,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#ff6b6b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#ef4444';
              }}
              title="Delete project"
            >
              🗑️
            </button>
          )}
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
  const [form, setForm] = useState({ name:'', description:'', color: COLORS.avatarColors[0], team_ids:[] });
  const [saving, setSaving] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');

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
      // Only send team_ids if there are teams selected (we'll handle multiple teams on backend)
      if (payload.team_ids && payload.team_ids.length > 0) {
        payload.team_id = payload.team_ids[0]; // For now, backend expects single team_id
      }
      delete payload.team_ids;
      const { data } = await api.post('/projects', payload);
      setProjects(p => [data.project, ...p]);
      setShowModal(false);
      setForm({ name:'', description:'', color: COLORS.avatarColors[0], team_ids:[] });
      toast?.success('Project created!');
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to create project');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      setProjects(p => p.filter(proj => proj.id !== projectToDelete.id));
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      toast?.success('Project deleted successfully!');
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to delete project');
    } finally { setDeleting(false); }
  }

  const openDeleteConfirm = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

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
          {projects.map(p => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              onClick={() => navigate(`/projects/${p.id}`)}
              onDelete={openDeleteConfirm}
              isAdmin={user?.role === 'admin'}
            />
          ))}
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
                <label>Assign to Teams <small style={{color:'var(--text-3)'}}>(Optional)</small></label>
                <button 
                  type="button"
                  onClick={() => setShowTeamModal(true)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: 8,
                    color: 'var(--text)',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                >
                  <span>
                    {form.team_ids.length === 0 
                      ? 'Select Teams...' 
                      : `${form.team_ids.length} team${form.team_ids.length !== 1 ? 's' : ''} selected`}
                  </span>
                  <span style={{ fontSize: 16 }}>▼</span>
                </button>
                {form.team_ids.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.team_ids.map(teamId => {
                      const team = availableTeams.find(t => t.id === teamId);
                      return team ? (
                        <div key={teamId} style={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: '1px solid rgba(99, 102, 241, 0.4)',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          color: '#a78bfa',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          {team.name}
                          <button
                            type="button"
                            onClick={() => setForm(p => ({...p, team_ids: p.team_ids.filter(id => id !== teamId)}))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#a78bfa',
                              cursor: 'pointer',
                              fontSize: 14,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
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

      {showDeleteConfirm && projectToDelete && (
        <Modal title="Delete Project" onClose={() => { setShowDeleteConfirm(false); setProjectToDelete(null); }}>
          <div style={{ paddingBottom: 16 }}>
            <p style={{ color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>"{projectToDelete.name}"</strong>?
            </p>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              padding: 12,
              fontSize: 13,
              color: '#fca5a5',
              marginBottom: 16
            }}>
              ⚠️ This action cannot be undone. All tasks and data associated with this project will be permanently deleted.
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => { setShowDeleteConfirm(false); setProjectToDelete(null); }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                opacity: deleting ? 0.6 : 1,
                cursor: deleting ? 'not-allowed' : 'pointer'
              }}
            >
              {deleting ? <span className="spinner"/> : '🗑️ Delete Project'}
            </button>
          </div>
        </Modal>
      )}

      {showTeamModal && user?.role === 'admin' && (
        <Modal title="Select Teams" onClose={() => { setShowTeamModal(false); setTeamSearch(''); }}>
          <div style={{ paddingBottom: 16 }}>
            {/* Search Input */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Search teams..."
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onFocus={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                }}
                onBlur={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              />
            </div>

            {/* Teams List */}
            <div style={{
              maxHeight: 300,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 20
            }}>
              {availableTeams
                .filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
                .map(team => (
                  <label key={team.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  >
                    <input
                      type="checkbox"
                      checked={form.team_ids.includes(team.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm(p => ({...p, team_ids: [...p.team_ids, team.id]}));
                        } else {
                          setForm(p => ({...p, team_ids: p.team_ids.filter(id => id !== team.id)}));
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        accentColor: 'var(--primary)',
                        width: 18,
                        height: 18
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{team.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 2 }}>
                        {team.member_count || 0} members
                      </div>
                    </div>
                  </label>
                ))}
              {availableTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: 20 }}>
                  No teams found
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => { setShowTeamModal(false); setTeamSearch(''); }}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => { setShowTeamModal(false); setTeamSearch(''); }}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

