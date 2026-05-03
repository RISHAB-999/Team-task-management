const { z } = require('zod');
const supabase = require('../config/supabase');

const taskSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
  assignee_id: z.string().uuid().nullable().optional(),
  status:      z.enum(['todo','in_progress','done']).optional().default('todo'),
  priority:    z.enum(['low','medium','high']).optional().default('medium'),
  due_date:    z.string().nullable().optional(),
});

const TASK_SELECT = `*, assignee:users!assignee_id(id,name,avatar_color,avatar_url), creator:users!creator_id(id,name), project:projects!project_id(id,name,color)`;

exports.getMyTasks = async (req, res) => {
  const { status, priority, search } = req.query;
  let query = supabase.from('tasks').select(TASK_SELECT)
    .eq('assignee_id', req.user.id)
    .order('updated_at', { ascending: false });

  if (status)   query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (search)   query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tasks: data || [] });
};

exports.getProjectTasks = async (req, res) => {
  const { status, priority } = req.query;
  let query = supabase.from('tasks')
    .select(`*, assignee:users!assignee_id(id,name,avatar_color,avatar_url), creator:users!creator_id(id,name)`)
    .eq('project_id', req.params.projectId)
    .order('created_at', { ascending: false });

  if (status)   query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tasks: data || [] });
};

exports.create = async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { title, description, assignee_id, status, priority, due_date } = parsed.data;
  const { data, error } = await supabase.from('tasks')
    .insert({ title: title.trim(), description, project_id: req.params.projectId, assignee_id: assignee_id || null, creator_id: req.user.id, status, priority, due_date: due_date || null })
    .select(TASK_SELECT).single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ task: data });
};

exports.update = async (req, res) => {
  const { data: task } = await supabase.from('tasks').select('*, project:projects!project_id(id)').eq('id', req.params.id).single();
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { data: member } = await supabase.from('project_members')
    .select('role').eq('project_id', task.project_id).eq('user_id', req.user.id).single();

  if (!member && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });

  const isAdmin = req.user.role === 'admin' || member?.role === 'admin';

  let updates = {};
  if (!isAdmin) {
    if (task.assignee_id !== req.user.id)
      return res.status(403).json({ error: 'You can only update your own assigned tasks' });
    const safe = z.object({ status: z.enum(['todo','in_progress','done']).optional(), description: z.string().max(1000).optional() }).safeParse(req.body);
    if (!safe.success) return res.status(400).json({ error: safe.error.errors[0].message });
    updates = safe.data;
  } else {
    const parsed = taskSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    updates = parsed.data;
  }

  const { data, error } = await supabase.from('tasks').update(updates).eq('id', req.params.id).select(TASK_SELECT).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ task: data });
};

exports.remove = async (req, res) => {
  const { data: task } = await supabase.from('tasks').select('project_id').eq('id', req.params.id).single();
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { data: member } = await supabase.from('project_members')
    .select('role').eq('project_id', task.project_id).eq('user_id', req.user.id).single();
  if (req.user.role !== 'admin' && member?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });

  await supabase.from('tasks').delete().eq('id', req.params.id);
  res.json({ message: 'Task deleted' });
};

exports.getDashboardStats = async (req, res) => {
  try {
    const uid = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const projectQuery = isAdmin
      ? supabase.from('projects').select('*', { count: 'exact', head: true })
      : supabase.from('project_members').select('*', { count: 'exact', head: true }).eq('user_id', uid);

    const taskFilter = isAdmin ? {} : { or: `assignee_id.eq.${uid},creator_id.eq.${uid}` };

    const [{ count: projectCount }, { data: tasks }] = await Promise.all([
      projectQuery,
      isAdmin
        ? supabase.from('tasks').select('status, priority, due_date')
        : supabase.from('tasks').select('status, priority, due_date').or(`assignee_id.eq.${uid},creator_id.eq.${uid}`),
    ]);

    const now = new Date().toISOString().split('T')[0];
    const taskStats = {
      total:       tasks?.length || 0,
      todo:        tasks?.filter(t => t.status === 'todo').length || 0,
      in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      done:        tasks?.filter(t => t.status === 'done').length || 0,
      overdue:     tasks?.filter(t => t.due_date && t.due_date < now && t.status !== 'done').length || 0,
    };

    const TASK_DETAIL = `id, title, status, priority, due_date, created_at, updated_at, project_id, project:projects!project_id(name,color), assignee:users!assignee_id(name,avatar_color,avatar_url)`;

    const [{ data: overdueTasks, error: err1 }, { data: upcomingTasks, error: err2 }, { data: recentTasks, error: err3 }] = await Promise.all([
      isAdmin
        ? supabase.from('tasks').select(TASK_DETAIL).lt('due_date', now).neq('status','done').order('due_date').limit(5)
        : supabase.from('tasks').select(TASK_DETAIL).lt('due_date', now).neq('status','done').or(`assignee_id.eq.${uid},creator_id.eq.${uid}`).order('due_date').limit(5),
      isAdmin
        ? supabase.from('tasks').select(TASK_DETAIL).gte('due_date', now).neq('status','done').order('due_date').limit(5)
        : supabase.from('tasks').select(TASK_DETAIL).gte('due_date', now).neq('status','done').or(`assignee_id.eq.${uid},creator_id.eq.${uid}`).order('due_date').limit(5),
      isAdmin
        ? supabase.from('tasks').select(TASK_DETAIL).order('updated_at', { ascending: false }).limit(6)
        : supabase.from('tasks').select(TASK_DETAIL).or(`assignee_id.eq.${uid},creator_id.eq.${uid}`).order('updated_at', { ascending: false }).limit(6),
    ]);

    if (err1) throw new Error(err1.message);
    if (err2) throw new Error(err2.message);
    if (err3) throw new Error(err3.message);

    res.json({ projectCount, taskStats, overdueTasks: overdueTasks || [], upcomingTasks: upcomingTasks || [], recentTasks: recentTasks || [] });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.getTimelineTasks = async (req, res) => {
  try {
    const uid = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = supabase.from('tasks').select(`
      id, title, status, priority, due_date, created_at, updated_at, project_id,
      project:projects!project_id(id, name, color),
      assignee:users!assignee_id(id, name, avatar_color, avatar_url)
    `);

    if (!isAdmin) {
      // Get IDs of projects where user is a member
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', uid);
      
      const projectIds = memberProjects?.map(mp => mp.project_id) || [];
      query = query.in('project_id', projectIds);
    }

    const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false });
    
    if (error) throw error;
    res.json({ tasks: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
