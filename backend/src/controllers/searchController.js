const supabase = require('../config/supabase');

exports.search = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ tasks: [], projects: [] });

  const uid = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    isAdmin
      ? supabase.from('tasks').select('id, title, status, priority, project:projects!project_id(id,name,color)').ilike('title', `%${q}%`).limit(8)
      : supabase.from('tasks').select('id, title, status, priority, project:projects!project_id(id,name,color)').ilike('title', `%${q}%`).or(`assignee_id.eq.${uid},creator_id.eq.${uid}`).limit(8),
    isAdmin
      ? supabase.from('projects').select('id, name, description, color, status').ilike('name', `%${q}%`).limit(5)
      : supabase.from('projects').select('id, name, description, color, status').ilike('name', `%${q}%`)
          .in('id', (await supabase.from('project_members').select('project_id').eq('user_id', uid)).data?.map(r => r.project_id) || []).limit(5),
  ]);

  res.json({ tasks: tasks || [], projects: projects || [] });
};
