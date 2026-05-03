import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';

export default function Teams({ toast }) {
  const { user } = useAuth();
  const [teams, setTeams]     = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(null); // holds the team object
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  
  const [form, setForm]       = useState({ name:'', description:'', members: [] });
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    fetchTeams();
    if (user?.role === 'admin') {
      api.get('/users').then(r => setAllUsers(r.data.users)).catch(()=>{});
    }
  }, [user?.role]);

  async function fetchTeams() {
    try {
      const { data } = await api.get('/teams');
      setTeams(data.teams);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/teams', form);
      setTeams(prev => [data.team, ...prev]);
      setShowCreateModal(false);
      setForm({ name:'', description:'', members: [] });
      toast?.success('Team created!');
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  async function openManage(team) {
    try {
      const { data } = await api.get(`/teams/${team.id}`);
      setShowManageModal(data); // data has { team, members }
    } catch (err) {
      toast?.error('Could not load team details');
    }
  }

  async function handleBulkAddMembers(e) {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        selectedUserIds.map(userId => 
          api.post(`/teams/${showManageModal.team.id}/members`, { userId, role: 'member' })
        )
      );
      toast?.success(`${selectedUserIds.length} members added`);
      setSelectedUserIds([]);
      openManage(showManageModal.team); // Refresh modal data
      fetchTeams(); // Refresh list to update counts
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to add members');
    } finally { setSaving(false); }
  }

  async function handleRemoveMember(userId) {
    if(!confirm('Remove this member from the team?')) return;
    try {
      await api.delete(`/teams/${showManageModal.team.id}/members/${userId}`);
      toast?.success('Member removed');
      openManage(showManageModal.team); // Refresh modal data
      fetchTeams(); // Refresh counts
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to remove');
    }
  }

  async function openDeleteConfirm(team) {
    setTeamToDelete(team);
    setShowDeleteConfirm(true);
  }

  async function handleDeleteTeam() {
    if (!teamToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/teams/${teamToDelete.id}`);
      setTeams(t => t.filter(team => team.id !== teamToDelete.id));
      setShowDeleteConfirm(false);
      setTeamToDelete(null);
      if (showManageModal?.team?.id === teamToDelete.id) {
        setShowManageModal(null);
      }
      toast?.success('Team deleted successfully!');
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to delete team');
    } finally { setDeleting(false); }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (loading) return <div className="page"><div style={{color:'var(--text-2)'}}>Loading…</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Teams</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ New Team</button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👥</div>
          <h3>No teams yet</h3>
          {user?.role === 'admin' && <p>Create a team to group members and projects</p>}
        </div>
      ) : (
        <div className="projects-grid">
          {teams.map(team => (
            <div key={team.id} className="card" style={{ cursor: user?.role === 'admin' ? 'pointer' : 'default', position: 'relative' }} onClick={() => user?.role === 'admin' && openManage(team)}>
              {user?.role === 'admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirm(team);
                  }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
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
                  title="Delete team"
                >
                  🗑️
                </button>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--primary),var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👥</div>
                <div>
                  <div style={{ fontWeight:600 }}>{team.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-2)' }}>{team.member_count || 0} members</div>
                </div>
              </div>
              {team.description && <div style={{ fontSize:13, color:'var(--text-2)' }}>{team.description}</div>}
              {user?.role === 'admin' && (
                <div style={{ fontSize:11, color:'var(--primary)', marginTop:12, fontWeight:500 }}>
                  Manage Members →
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <Modal title="New Team" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Team Name *</label>
              <input type="text" placeholder="e.g. Design Team" value={form.name}
                onChange={e => setForm(p => ({...p, name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="What does this team work on?" value={form.description}
                onChange={e => setForm(p => ({...p, description:e.target.value}))} />
            </div>
            {allUsers.length > 1 && (
              <div className="form-group">
                <label>Add Members <small style={{color:'var(--text-3)'}}>(Optional)</small></label>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {allUsers.filter(u => u.id !== user.id).map(u => (
                      <div key={u.id} 
                        onClick={() => {
                          const isSelected = form.members.includes(u.id);
                          setForm(p => ({
                            ...p, 
                            members: isSelected ? p.members.filter(id => id !== u.id) : [...p.members, u.id]
                          }));
                        }}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', 
                          borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                          background: form.members.includes(u.id) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          marginBottom: 4
                        }}
                      >
                        <div style={{ 
                          width: 18, height: 18, borderRadius: 4, border: '2px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: form.members.includes(u.id) ? 'var(--primary)' : 'transparent',
                          borderColor: form.members.includes(u.id) ? 'var(--primary)' : 'var(--border)'
                        }}>
                          {form.members.includes(u.id) && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                        </div>
                        <div className="avatar" style={{ width:32, height:32, fontSize:12, background: u.avatar_url ? `url('${u.avatar_url}')` : u.avatar_color, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}>
                          {!u.avatar_url && u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner"/> : 'Create Team'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MANAGE MEMBERS MODAL */}
      {showManageModal && (
        <Modal title={`Manage Team: ${showManageModal.team.name}`} onClose={() => { setShowManageModal(null); setSelectedUserIds([]); setMemberSearch(''); }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize:13, marginBottom:12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Members ({showManageModal.members.length})</h4>
            {showManageModal.members.length === 0 ? (
              <div style={{ fontSize:13, color:'var(--text-2)', padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>No members yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                {showManageModal.members.map(m => (
                  <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.02)', borderRadius: 8, border:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="avatar" style={{ width:28, height:28, fontSize:11, background: m.avatar_url ? `url('${m.avatar_url}')` : m.avatar_color, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        {!m.avatar_url && m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize:11, color: 'var(--text-3)' }}>{m.email}</div>
                      </div>
                    </div>
                    {m.id !== showManageModal.team.owner_id && (
                      <button className="btn btn-ghost" style={{ color:'var(--danger)', padding:'4px 8px', fontSize:11, height: 'auto' }} onClick={() => handleRemoveMember(m.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop:'1px solid var(--border)', paddingTop:20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize:13, margin: 0, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Add New Members</h4>
              {selectedUserIds.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{selectedUserIds.length} selected</span>
              )}
            </div>
            
            <input 
              type="text" 
              placeholder="Search users..." 
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              style={{ marginBottom: 12, fontSize: 13, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', width: '100%', color: '#fff' }}
            />

            <div style={{ 
              maxHeight: 250, overflowY: 'auto', 
              border: '1px solid var(--border)', borderRadius: 8, 
              padding: 4, background: 'rgba(0,0,0,0.1)'
            }}>
              {allUsers
                .filter(u => !showManageModal.members.some(m => m.id === u.id))
                .filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.toLowerCase().includes(memberSearch.toLowerCase()))
                .map(u => (
                  <div key={u.id} 
                    onClick={() => toggleUserSelection(u.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', 
                      borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                      background: selectedUserIds.includes(u.id) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      marginBottom: 2
                    }}
                  >
                    <div style={{ 
                      width: 18, height: 18, borderRadius: 4, border: '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: selectedUserIds.includes(u.id) ? 'var(--primary)' : 'transparent',
                      borderColor: selectedUserIds.includes(u.id) ? 'var(--primary)' : 'var(--border)'
                    }}>
                      {selectedUserIds.includes(u.id) && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                    </div>
                    <div className="avatar" style={{ width:32, height:32, fontSize:12, background: u.avatar_url ? `url('${u.avatar_url}')` : u.avatar_color, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      {!u.avatar_url && u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                    </div>
                  </div>
              ))}
              {allUsers.filter(u => !showManageModal.members.some(m => m.id === u.id)).length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No more users to add.</div>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <button 
                onClick={handleBulkAddMembers} 
                className="btn btn-primary" 
                disabled={saving || selectedUserIds.length === 0}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {saving ? <span className="spinner"/> : `Add ${selectedUserIds.length} Member${selectedUserIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && teamToDelete && (
        <Modal title="Delete Team" onClose={() => { setShowDeleteConfirm(false); setTeamToDelete(null); }}>
          <div style={{ paddingBottom: 16 }}>
            <p style={{ color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>"{teamToDelete.name}"</strong>?
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
              ⚠️ This action cannot be undone. All team data and associated projects will be permanently deleted.
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => { setShowDeleteConfirm(false); setTeamToDelete(null); }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn"
              onClick={handleDeleteTeam}
              disabled={deleting}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                opacity: deleting ? 0.6 : 1,
                cursor: deleting ? 'not-allowed' : 'pointer'
              }}
            >
              {deleting ? <span className="spinner"/> : '🗑️ Delete Team'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
