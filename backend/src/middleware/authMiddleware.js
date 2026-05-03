const supabase = require('../config/supabase');
const { verifyToken } = require('../utils/token');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = verifyToken(header.slice(7));
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_color, avatar_url')
      .eq('id', payload.id)
      .single();
    if (error || !user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
