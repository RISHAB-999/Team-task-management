import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import Modal from '../components/Modal';

export default function Admin() {
  const { user } = useAuth();
  const showToast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await api.get('/users');
      setMembers(res.data.users || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePromote = async (memberId) => {
    try {
      await api.put(`/users/${memberId}/promote`);
      showToast('Member promoted to admin', 'success');
      loadMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to promote member', 'error');
    }
  };

  const handleDeleteMember = (member) => {
    if (member.id === user?.id) {
      showToast('You cannot delete your own account', 'error');
      return;
    }
    setMemberToDelete(member);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${memberToDelete.id}`);
      showToast('Member account deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
      loadMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete member', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="page" style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div className="page" style={{ maxWidth: '100%', padding: '40px 40px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Admin</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>Manage team members and permissions</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.08)';
            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.05)';
            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        />
      </div>

      {/* Members Table */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1.5fr',
          gap: 0,
          padding: '16px 24px',
          background: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-2)',
          letterSpacing: 0.5,
          textTransform: 'uppercase'
        }}>
          <div>Member</div>
          <div>Email</div>
          <div>Role</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>

        {filteredMembers.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-2)' }}>
            No members found
          </div>
        ) : (
          filteredMembers.map((member, idx) => (
            <div
              key={member.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1.5fr',
                gap: 0,
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.02)',
                alignItems: 'center',
                background: idx % 2 === 0 ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.005)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.005)'}
            >
              {/* Member */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: member.avatar_color || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    member.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{member.name}</span>
                {member.id === user?.id && (
                  <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>(You)</span>
                )}
              </div>

              {/* Email */}
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{member.email}</div>

              {/* Role */}
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                background: member.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: member.role === 'admin' ? '#d8b4fe' : '#a5b4fc',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                width: 'fit-content'
              }}>
                {member.role}
              </div>

              {/* Joined */}
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>
                {new Date(member.created_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
                {member.role === 'member' && member.id !== user?.id && (
                  <button
                    onClick={() => handlePromote(member.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      color: '#d8b4fe',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.3)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(168, 85, 247, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    ⬆ Promote
                  </button>
                )}

                {member.id !== user?.id && (
                  <button
                    onClick={() => handleDeleteMember(member)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && memberToDelete && (
        <Modal
          title="Delete Member Account"
          onClose={() => !deleting && setShowDeleteConfirm(false)}
          width={440}
        >
          <div style={{ padding: '0 0 24px 0' }}>
            <div style={{ 
              padding: 16, 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <p style={{ color: '#fca5a5', margin: 0, fontSize: 13, fontWeight: 500 }}>
                ⚠️ This action cannot be undone!
              </p>
            </div>

            <p style={{ color: 'var(--text)', marginBottom: 12 }}>
              Are you sure you want to delete the account for <strong>{memberToDelete.name}</strong>?
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 0 }}>
              All associated data will be permanently removed from the system.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => !deleting && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              style={{
                padding: '10px 20px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)')}
              onMouseLeave={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
