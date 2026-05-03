const { z } = require('zod');
const supabase = require('../config/supabase');
const { getRandomProjectColor } = require('../utils/colors');

const projectSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  color:       z.string().optional(),
  team_id:     z.string().uuid().optional().nullable(),
});

const getProjectWithStats = async (id) => {
  const { data } = await supabase.rpc('get_project_stats', { p_id: id }).single();
  if (data) return data;
  // fallback: plain select
  const { data: p } = await supabase.from('projects')
    .select('*, owner:users!owner_id(name, avatar_color)')
    .eq('id', id).single();
  return p;
};

exports.getAll = async (req, res) => {
  let query = supabase.from('projects')
    .select(`*, owner:users!owner_id(name, avatar_color),
      project_members(user:users(id, name, avatar_color, avatar_url))`)
    .order('created_at', { ascending: false });

  if (req.user.role !== 'admin') {
    const { data: myProjects } = await supabase
      .from('project_members').select('project_id').eq('user_id', req.user.id);
    const ids = myProjects?.map(r => r.project_id) || [];
    query = query.in('id', ids);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  
  // Fetch task counts for each project
  const projects = [];
  for (const project of (data || [])) {
    // Get task statistics
    const { count: taskCount } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id);
    
    const { count: doneCount } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id)
      .eq('status', 'done');
    
    // Extract members array from project_members junction table
    const members = (project.project_members || []).map(pm => pm.user).filter(Boolean);
    
    projects.push({
      ...project,
      task_count: taskCount || 0,
      done_count: doneCount || 0,
      member_count: members.length || 0,
      members: members
    });
  }
  
  res.json({ projects });
};

exports.create = async (req, res) => {
  // Only admins can create projects
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create projects' });
  }

  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { name, description, color, team_id } = parsed.data;
  const projectColor = color || getRandomProjectColor();

  const { data: project, error } = await supabase.from('projects')
    .insert({ name: name.trim(), description, owner_id: req.user.id, color: projectColor, team_id: team_id || null })
    .select().single();

  if (error) return res.status(500).json({ error: error.message });

  const projectMembers = [{ project_id: project.id, user_id: req.user.id, role: 'admin' }];

  if (team_id) {
    const { data: teamMembers } = await supabase.from('team_members').select('user_id').eq('team_id', team_id);
    if (teamMembers) {
      teamMembers.forEach(tm => {
        if (tm.user_id !== req.user.id) {
          projectMembers.push({ project_id: project.id, user_id: tm.user_id, role: 'member' });
        }
      });
    }
  }

  await supabase.from('project_members').insert(projectMembers);

  res.status(201).json({ project });
};

exports.getOne = async (req, res) => {
  const { data: project, error } = await supabase.from('projects')
    .select('*, owner:users!owner_id(name, avatar_color)')
    .eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Project not found' });

  const { data: members } = await supabase.from('project_members')
    .select('role, joined_at, user:users(id, name, email, avatar_color, avatar_url)')
    .eq('project_id', req.params.id);

  res.json({ project, members: members?.map(m => ({ ...m.user, role: m.role, joined_at: m.joined_at })) || [] });
};

exports.update = async (req, res) => {
  const { name, description, status, color, team_id } = req.body;
  const updates = {};
  if (name !== undefined)        updates.name = name;
  if (description !== undefined) updates.description = description;
  if (status !== undefined)      updates.status = status;
  if (color !== undefined)       updates.color = color;
  if (team_id !== undefined)     updates.team_id = team_id;

  const { data, error } = await supabase.from('projects')
    .update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ project: data });
};

exports.remove = async (req, res) => {
  const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Project deleted' });
};

exports.addMember = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const { data: user, error: ue } = await supabase.from('users')
    .select('id, name, email, avatar_color, avatar_url').eq('id', userId).single();
  if (ue) return res.status(404).json({ error: 'User not found' });

  const memberRole = ['admin','member'].includes(role) ? role : 'member';
  await supabase.from('project_members')
    .upsert({ project_id: req.params.id, user_id: userId, role: memberRole });

  res.json({ message: 'Member added', user: { ...user, role: memberRole } });
};

exports.removeMember = async (req, res) => {
  const { data: project } = await supabase.from('projects').select('owner_id').eq('id', req.params.id).single();
  if (project?.owner_id === req.params.userId)
    return res.status(400).json({ error: 'Cannot remove project owner' });

  await supabase.from('project_members')
    .delete().eq('project_id', req.params.id).eq('user_id', req.params.userId);
  res.json({ message: 'Member removed' });
};
