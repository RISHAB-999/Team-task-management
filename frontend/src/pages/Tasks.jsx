import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';

const STATUSES = ['todo','in_progress','done'];
const STATUS_LABELS = { todo:'To Do', in_progress:'In Progress', done:'Done' };
const STATUS_COLORS = { todo:'#94a3b8', in_progress:'#6366f1', done:'#10b981' };

export default function Tasks({ toast }) {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject]   = useState(null);
  const [members, setMembers]   = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);

  const [showTaskModal, setShowTaskModal]       = useState(false);
  const [showMemberTaskModal, setShowMemberTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal]   = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [tempAssigneeId, setTempAssigneeId] = useState('');
  const [editTask, setEditTask]                 = useState(null);
  const [taskForm, setTaskForm]                 = useState({ title:'', description:'', assigneeId:'', priority:'medium', status:'todo', dueDate:'' });
  const [memberForm, setMemberForm]             = useState({ status:'', description:'' });
  const [saving, setSaving] = useState(false);

  const isAdmin = user.role === 'admin' || members.find(m => m.id === user.id)?.role === 'admin';

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/tasks/project/${projectId}`),
      isAdmin ? api.get('/users') : Promise.resolve({ data:{ users:[] } }),
    ]).then(([p, t, u]) => {
      setProject(p.data.project);
      setMembers(p.data.members);
      setTasks(t.data.tasks);
      setAllUsers(u.data.users);
      setLoading(false);
    }).catch(() => { navigate('/projects'); });
  }, [projectId]);

  async function handleStatusChange(taskId, status) {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(ts => ts.map(t => t.id === taskId ? data.task : t));
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
  }

  function openCreate() { setEditTask(null); setTaskForm({ title:'', description:'', assigneeId:'', priority:'medium', status:'todo', dueDate:'' }); setShowTaskModal(true); }
  function openEdit(task) {
    setEditTask(task);
    setTaskForm({ title:task.title, description:task.description||'', assigneeId:task.assignee_id||'', priority:task.priority, status:task.status, dueDate:task.due_date||'' });
    setShowTaskModal(true);
  }

  // Members click on their own tasks → limited modal
  function openMemberEdit(task) {
    setEditTask(task);
    setMemberForm({ status: task.status, description: task.description || '' });
    setShowMemberTaskModal(true);
  }

  // Decide which modal to open based on role + ownership
  function handleTaskClick(task) {
    if (isAdmin) { openEdit(task); return; }
    if (task.assignee_id === user.id) { openMemberEdit(task); }
    // If not assigned to me and not admin → no action
  }

  async function handleSaveTask(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        ...taskForm, 
        assignee_id: taskForm.assigneeId || null, 
        due_date: taskForm.dueDate || null 
      };
      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask.id}`, payload);
        setTasks(ts => ts.map(t => t.id === editTask.id ? data.task : t));
        toast?.success('Task updated!');
      } else {
        const { data } = await api.post(`/tasks/project/${projectId}`, payload);
        setTasks(ts => [data.task, ...ts]);
        toast?.success('Task created!');
      }
      setShowTaskModal(false);
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  async function handleMemberSaveTask(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/tasks/${editTask.id}`, {
        status: memberForm.status,
        description: memberForm.description,
      });
      setTasks(ts => ts.map(t => t.id === editTask.id ? data.task : t));
      toast?.success('Task updated!');
      setShowMemberTaskModal(false);
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  async function handleDeleteTask(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      setTasks(ts => ts.filter(t => t.id !== task.id));
      setShowTaskModal(false);
      toast?.success('Task deleted');
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
  }



  async function handleBulkAddMembers() {
    if (selectedUserIds.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(selectedUserIds.map(userId => 
        api.post(`/projects/${projectId}/members`, { userId })
      ));
      const { data } = await api.get(`/projects/${projectId}`);
      setMembers(data.members);
      toast?.success(`${selectedUserIds.length} members added!`);
      setShowUserSearchModal(false);
      setSelectedUserIds([]);
    } catch (err) { 
      toast?.error('Failed to add some members'); 
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMember(userId) {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      setMembers(ms => ms.filter(m => m.id !== userId));
      toast?.success('Member removed');
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
  }

  function openAssigneeModal() {
    setTempAssigneeId(taskForm.assigneeId || '');
    setShowAssigneeModal(true);
  }

  function saveAssigneeModal() {
    setTaskForm(p => ({ ...p, assigneeId: tempAssigneeId }));
    setShowAssigneeModal(false);
  }

  if (loading) return <div className="page"><div style={{color:'var(--text-2)'}}>Loading…</div></div>;

  const grouped = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:12, height:12, borderRadius:'50%', background:project?.color }} />
          <div>
            <h1>{project?.name}</h1>
            {project?.description && <p style={{ fontSize:13, color:'var(--text-2)', marginTop:2 }}>{project.description}</p>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(true)}>👥 Members ({members.length})</button>}
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Task</button>}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban">
        {STATUSES.map(status => (
          <div key={status} className="kanban-col">
            <div className="kanban-col-header">
              <span className="col-title">
                <span style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[status], display:'inline-block' }}/>
                {STATUS_LABELS[status]}
              </span>
              <span className="col-count">{grouped[status].length}</span>
            </div>
            <div className="kanban-tasks">
              {grouped[status].map(task => (
                <TaskCard key={task.id} task={task} onClick={handleTaskClick} onStatusChange={handleStatusChange} isAdmin={isAdmin} currentUserId={user.id} />
              ))}
              {grouped[status].length === 0 && (
                <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-3)', fontSize:12 }}>Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Create/Edit Modal */}
      {showTaskModal && (
        <Modal title={editTask ? 'Edit Task' : 'New Task'} onClose={() => setShowTaskModal(false)}>
          <form onSubmit={handleSaveTask}>
            <div className="form-group">
              <label>Title *</label>
              <input type="text" placeholder="Task title" value={taskForm.title}
                onChange={e => setTaskForm(p=>({...p,title:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Optional details..." value={taskForm.description}
                onChange={e => setTaskForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm(p=>({...p,priority:e.target.value}))}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              {editTask && (
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm(p=>({...p,status:e.target.value}))}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assign To</label>
                <div 
                  onClick={openAssigneeModal}
                  style={{ 
                    background: 'var(--bg-2)', border: '1px solid var(--border)', 
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, height: 42
                  }}
                >
                  {members.find(m => m.id === taskForm.assigneeId) ? (() => {
                    const m = members.find(m => m.id === taskForm.assigneeId);
                    return (
                      <>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: m.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, overflow: 'hidden' }}>
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            m.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span style={{ fontSize: 13 }}>{m.name}</span>
                      </>
                    );
                  })() : (
                    <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Unassigned</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate}
                  onChange={e => setTaskForm(p=>({...p,dueDate:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              {editTask && <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(editTask)}>Delete</button>}
              <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner"/> : editTask ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member Limited Edit Modal */}
      {showMemberTaskModal && editTask && (
        <Modal title="Update Task" onClose={() => setShowMemberTaskModal(false)}>
          {/* Read-only task info */}
          <div style={{ background:'var(--bg-3)', borderRadius:'var(--radius-sm)', padding:'12px 14px', marginBottom:16, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{editTask.title}</div>
            <div style={{ display:'flex', gap:8 }}>
              <span className={`badge badge-${editTask.priority}`}>{editTask.priority} priority</span>
              {editTask.due_date && <span style={{ fontSize:11, color:'var(--text-2)' }}>📅 Due {new Date(editTask.due_date).toLocaleDateString()}</span>}
            </div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:6 }}>🔒 Title, priority, assignee and due date can only be changed by an admin.</div>
          </div>
          <form onSubmit={handleMemberSaveTask}>
            <div className="form-group">
              <label>Status</label>
              <select value={memberForm.status} onChange={e => setMemberForm(p => ({...p, status:e.target.value}))}>
                <option value="todo">⏳ To Do</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={4} placeholder="Add notes or details..." value={memberForm.description}
                onChange={e => setMemberForm(p => ({...p, description:e.target.value}))} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowMemberTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner"/> : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <Modal title="Manage Members" onClose={() => { setShowMemberModal(false); setMemberSearch(''); }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <input 
              type="text" 
              placeholder="Search members..." 
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: 13 }}
            />
            <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowUserSearchModal(true)}>+ Add Member</button>
          </div>
          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            {members
              .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase()))
              .map(m => (
                <div key={m.id} className="member-row">
                  <div className="avatar" style={{ background: m.avatar_color, overflow: 'hidden' }}>
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{m.name}</div>
                    <div className="member-email">{m.email}</div>
                  </div>
                  <span className={`badge badge-${m.role}`}>{m.role}</span>
                  {m.id !== user.id && (
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleRemoveMember(m.id)}>✕</button>
                  )}
                </div>
            ))}
            {members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No members found.</div>
            )}
          </div>
        </Modal>
      )}

      {/* User Search Modal (for adding members) */}
      {showUserSearchModal && (
        <Modal title="Add Members" onClose={() => { setShowUserSearchModal(false); setSelectedUserIds([]); setMemberSearch(''); }}>
          <div style={{ marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Search all users..." 
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: 13 }}
            />
          </div>
          <div style={{ maxHeight: 350, overflowY: 'auto', margin: '0 -20px 20px -20px' }}>
            {allUsers
              .filter(u => !members.find(m => m.id === u.id))
              .filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.toLowerCase().includes(memberSearch.toLowerCase()))
              .map(u => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div 
                    key={u.id}
                    onClick={() => {
                      setSelectedUserIds(prev => 
                        isSelected ? prev.filter(id => id !== u.id) : [...prev, u.id]
                      );
                    }}
                    style={{ 
                      display: 'flex', alignItems: 'center', padding: '12px 20px', 
                      borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: 36, height: 36, borderRadius: '50%', background: u.avatar_color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16,
                      fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden'
                    }}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        u.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{u.email}</div>
                    </div>
                    <div style={{ 
                      width: 18, height: 18, borderRadius: 4, border: '2px solid',
                      borderColor: isSelected ? '#8b5cf6' : 'var(--border)',
                      background: isSelected ? '#8b5cf6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                    </div>
                  </div>
                );
            })}
            {allUsers.filter(u => !members.find(m => m.id === u.id)).filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No users found.</div>
            )}
          </div>
          <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
            <button className="btn btn-ghost" onClick={() => { setShowUserSearchModal(false); setSelectedUserIds([]); setMemberSearch(''); }}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={handleBulkAddMembers} 
              disabled={selectedUserIds.length === 0 || saving}
            >
              {saving ? <span className="spinner"/> : `Add Selected (${selectedUserIds.length})`}
            </button>
          </div>
        </Modal>
      )}

      {/* Select Assignee Modal */}
      {showAssigneeModal && (
        <Modal title="Select User" onClose={() => setShowAssigneeModal(false)}>
          <div style={{ maxHeight: 350, overflowY: 'auto', margin: '-10px -20px 20px -20px' }}>
            
            {/* Unassigned Option */}
            <div 
              onClick={() => setTempAssigneeId('')}
              style={{ 
                display: 'flex', alignItems: 'center', padding: '16px 20px', 
                borderBottom: '1px solid var(--border)', cursor: 'pointer',
                background: tempAssigneeId === '' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ 
                width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-3)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16, color: 'var(--text-3)'
              }}>
                ?
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Unassigned</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No assignee</div>
              </div>
              <div style={{ 
                width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                borderColor: tempAssigneeId === '' ? '#8b5cf6' : 'var(--border)',
                background: tempAssigneeId === '' ? '#8b5cf6' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {tempAssigneeId === '' && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
              </div>
            </div>

            {/* Members List */}
            {members.map(m => {
              const isSelected = tempAssigneeId === m.id;
              return (
                <div 
                  key={m.id}
                  onClick={() => setTempAssigneeId(m.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '16px 20px', 
                    borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ 
                    width: 40, height: 40, borderRadius: '50%', background: m.avatar_color, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16,
                    fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden'
                  }}>
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.name.slice(0,2).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{m.email}</div>
                  </div>
                  <div style={{ 
                    width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                    borderColor: isSelected ? '#8b5cf6' : 'var(--border)',
                    background: isSelected ? '#8b5cf6' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSelected && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="modal-footer" style={{ borderTop: 'none', padding: 0 }}>
            <button className="btn btn-ghost" onClick={() => setShowAssigneeModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveAssigneeModal}>Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
