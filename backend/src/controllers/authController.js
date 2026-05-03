const bcrypt = require('bcryptjs');
const { z } = require('zod');
const supabase = require('../config/supabase');
const { generateToken } = require('../utils/token');
const { getRandomAvatarColor } = require('../utils/colors');

const signupSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

exports.signup = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { name, email, password, role } = parsed.data;

  const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const assignedRole = count === 0 ? 'admin' : 'member';
  const hash  = bcrypt.hashSync(password, 10);
  const color = getRandomAvatarColor();

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name: name.trim(), email: email.toLowerCase(), password_hash: hash, role: assignedRole, avatar_color: color })
    .select('id, name, email, role, avatar_color, avatar_url, created_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ user, token: generateToken({ id: user.id }) });
};

exports.login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { email, password } = parsed.data;
  const { data: user } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });

  const { password_hash, ...safe } = user;
  res.json({ user: safe, token: generateToken({ id: user.id }) });
};

exports.me = (req, res) => res.json({ user: req.user });
