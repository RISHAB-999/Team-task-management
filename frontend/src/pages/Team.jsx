import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Team({ toast }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/users').then(r => { setUsers(r.data.users); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function toggleRole(u) {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    try {
      const { data } = await api.put(`/users/${u.id}/role`, { role: newRole });
      setUsers(us => us.map(x => x.id === u.id ? data.user : x));
      toast?.success(`${u.name} is now ${newRole}`);
    } catch (err) { toast?.error(err.response?.data?.error || 'Failed'); }
  }

  if (loading) return <div className="page"><div style={{color:'var(--text-2)'}}>Loading…</div></div>;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page" style={{ padding: '40px 40px' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Team Members</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{users.length} registered members in workspace</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 14 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, 
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', 
                color: '#fff', fontSize: 13, transition: 'all 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px' }}>Member</th>
                <th style={{ padding: '16px 24px' }}>Email</th>
                <th style={{ padding: '16px 24px' }}>Role</th>
                <th style={{ padding: '16px 24px' }}>Joined</th>
                <th style={{ padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div className="avatar" style={{ 
                        width: 32, height: 32,
                        background: u.avatar_url ? `url('${u.avatar_url}')` : u.avatar_color, 
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        border: '2px solid rgba(255,255,255,0.05)'
                      }}>
                        {!u.avatar_url && u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color:'var(--text-2)', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '16px 24px' }}><span className={`badge badge-${u.role}`} style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>{u.role}</span></td>
                  <td style={{ padding: '16px 24px', color:'var(--text-2)', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    {u.id !== currentUser?.id && (
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => toggleRole(u)}
                        disabled={u.role === 'admin' && users.filter(x => x.role === 'admin').length <= 1}
                        style={{ fontSize: 11, fontWeight: 600, color: u.role === 'admin' ? 'var(--warning)' : 'var(--primary)' }}
                      >
                        {u.role === 'admin' ? '↓ Demote' : '↑ Promote'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              No members found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
