const supabase = require('../config/supabase');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Global admin access required' });
  next();
};

const requireProjectMember = async (req, res, next) => {
  if (req.user.role === 'admin') { req.projectRole = 'admin'; return next(); }
  const projectId = req.params.projectId || req.params.id;
  const { data } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', req.user.id)
    .single();
  if (!data) return res.status(403).json({ error: 'Not a member of this project' });
  req.projectRole = data.role;
  next();
};

const requireProjectAdmin = async (req, res, next) => {
  if (req.user.role === 'admin') return next();
  const projectId = req.params.projectId || req.params.id;
  const { data } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', req.user.id)
    .single();
  if (!data || data.role !== 'admin')
    return res.status(403).json({ error: 'Project admin access required' });
  next();
};

module.exports = { requireAdmin, requireProjectMember, requireProjectAdmin };
