const supabase = require('../config/supabase');

exports.getAll = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_color, avatar_url, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data });
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin','member'].includes(role))
    return res.status(400).json({ error: 'Role must be admin or member' });
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Cannot change your own role' });

  const { data, error } = await supabase
    .from('users').update({ role }).eq('id', req.params.id)
    .select('id, name, email, role, avatar_color, avatar_url').single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json({ user: data });
};

exports.updateProfile = async (req, res) => {
  const { name, avatar_url, avatar_color } = req.body;
  const updates = {};
  if (name)        updates.name = name.trim();
  if (avatar_url)  updates.avatar_url = avatar_url;
  if (avatar_color) updates.avatar_color = avatar_color;

  const { data, error } = await supabase
    .from('users').update(updates).eq('id', req.user.id)
    .select('id, name, email, role, avatar_color, avatar_url').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ user: data });
};

const bcrypt = require('bcryptjs');

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) 
    return res.status(400).json({ error: 'Both passwords are required' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters' });

  // Get user's current password hash
  const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.user.id).single();
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  // Update with new password hash
  const hash = bcrypt.hashSync(newPassword, 10);
  const { error } = await supabase.from('users').update({ password_hash: hash }).eq('id', req.user.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Password updated successfully' });
};
