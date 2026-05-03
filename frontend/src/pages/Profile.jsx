import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import supabase from '../lib/supabaseClient';

export default function Profile({ toast }) {
  const { user, refreshUser } = useAuth();
  const [name, setName]           = useState(user?.name || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const fileRef = useRef();

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast?.error('Max file size is 10MB');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type))
      return toast?.error('Only JPG, PNG or WebP allowed');

    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await api.put('/users/me/profile', { avatar_url: publicUrl });
      await refreshUser();
      toast?.success('Avatar updated!');
    } catch (err) {
      toast?.error(err.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me/profile', { name });
      await refreshUser();
      toast?.success('Profile saved!');
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast?.error('New passwords do not match');
    }
    setChangingPwd(true);
    try {
      await api.put('/users/me/password', { 
        currentPassword: passwordForm.currentPassword, 
        newPassword: passwordForm.newPassword 
      });
      toast?.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setChangingPwd(false);
    }
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 850, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Profile Settings</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>Manage your personal information and account preferences.</p>
        </div>

      {/* Main Card with Glow Effect */}
      <div 
        className="card" 
        style={{ 
          padding: '36px 40px', 
          marginBottom: 24, 
          position: 'relative',
          boxShadow: '0 0 60px var(--accent-glow), 0 0 120px var(--primary-glow), 0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >

        {/* Avatar Section — Centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            {/* Gradient ring */}
            <div style={{
              width: 112, height: 112, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent), #ec4899)',
              padding: 3, boxShadow: '0 0 24px var(--accent-glow)'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: user?.avatar_color || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
                    {initials}
                  </div>
                )}
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="spinner" />
                  </div>
                )}
              </div>
            </div>
            {/* Pencil button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary)', border: '2px solid var(--bg-2)',
                color: 'var(--text)', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px var(--primary-glow)'
              }}
              title="Change photo"
            >✎</button>
          </div>

          <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} />

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <span>📷</span> {uploading ? 'Uploading…' : 'Upload new photo'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Role <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(managed by admin)</span></label>
              <input value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Account Type</label>
              <input value={user?.role === 'admin' ? 'Administrator' : 'Team Member'} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setName(user?.name || '')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 130 }}>
              {saving ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards Row */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* Security */}
        <div className="card" style={{ padding: '20px 22px', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔐</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Security</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 12 }}>
            Your password and account access settings.
          </div>
          <span 
            onClick={() => setShowPasswordModal(true)} 
            style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', display: 'inline-block' }}
          >
            Manage security →
          </span>
        </div>
      </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, padding: '32px 36px', position: 'relative' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, marginTop: 0 }}>Change Password</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>Ensure your account is using a long, random password to stay secure.</p>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  New Password 
                  <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Min 6 characters</span>
                </label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  required 
                  minLength={6}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 32 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={changingPwd} style={{ minWidth: 140 }}>
                  {changingPwd ? <span className="spinner" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
