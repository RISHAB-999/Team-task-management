const { z } = require('zod');
const supabase = require('../config/supabase');

const teamSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  members:     z.array(z.string().uuid()).optional().default([]),
});

exports.getAll = async (req, res) => {
  let query = supabase.from('teams')
    .select('*, owner:users!owner_id(name, avatar_color), team_members(count)')
    .order('created_at', { ascending: false });

  if (req.user.role !== 'admin') {
    const { data: myTeams } = await supabase.from('team_members').select('team_id').eq('user_id', req.user.id);
    const ids = myTeams?.map(r => r.team_id) || [];
    query = query.in('id', ids);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ teams: data || [] });
};

exports.create = async (req, res) => {
  const parsed = teamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { data: team, error } = await supabase.from('teams')
    .insert({ name: parsed.data.name, description: parsed.data.description, owner_id: req.user.id })
    .select().single();

  if (error) return res.status(500).json({ error: error.message });
  
  const teamMembers = [{ team_id: team.id, user_id: req.user.id, role: 'admin' }];
  if (parsed.data.members && parsed.data.members.length > 0) {
    parsed.data.members.forEach(mId => {
      if (mId !== req.user.id) teamMembers.push({ team_id: team.id, user_id: mId, role: 'member' });
    });
  }
  await supabase.from('team_members').insert(teamMembers);
  
  // Return team with members count for UI
  team.team_members = [{ count: teamMembers.length }];
  res.status(201).json({ team });
};

exports.getOne = async (req, res) => {
  const { data: team, error } = await supabase.from('teams')
    .select('*, owner:users!owner_id(name, avatar_color)').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Team not found' });

  const { data: members } = await supabase.from('team_members')
    .select('role, user:users(id, name, email, avatar_color, avatar_url)').eq('team_id', req.params.id);

  res.json({ team, members: members?.map(m => ({ ...m.user, role: m.role })) || [] });
};

exports.addMember = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const memberRole = ['admin','member'].includes(role) ? role : 'member';
  await supabase.from('team_members').upsert({ team_id: req.params.id, user_id: userId, role: memberRole });
  res.json({ message: 'Member added' });
};

exports.removeMember = async (req, res) => {
  await supabase.from('team_members').delete().eq('team_id', req.params.id).eq('user_id', req.params.userId);
  res.json({ message: 'Member removed' });
};

exports.remove = async (req, res) => {
  await supabase.from('teams').delete().eq('id', req.params.id);
  res.json({ message: 'Team deleted' });
};
