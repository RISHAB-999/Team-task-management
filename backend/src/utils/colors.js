// Backend Color Constants - Define all colors used throughout the app
const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
];

const PROJECT_COLORS = [
  '#6366f1', // indigo - primary
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
];

const STATUS_COLORS = {
  done: '#10b981',     // green - success
  in_progress: '#6366f1', // indigo - primary
  todo: '#94a3b8',     // slate - text-2
};

const PRIORITY_COLORS = {
  high: '#ef4444',   // red - danger
  medium: '#f59e0b', // amber - warning
  low: '#6366f1',    // indigo - primary
};

const THEME_COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  accent: '#a855f7',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textTertiary: '#475569',
  bg: '#0d0d15',
  border: 'rgba(255, 255, 255, 0.08)',
};

// Helper functions
const getRandomAvatarColor = () => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

const getRandomProjectColor = () => {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
};

const getAvatarColorByIndex = (index) => {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

const getProjectColorByIndex = (index) => {
  return PROJECT_COLORS[index % PROJECT_COLORS.length];
};

const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.todo;
};

const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
};

module.exports = {
  AVATAR_COLORS,
  PROJECT_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  THEME_COLORS,
  getRandomAvatarColor,
  getRandomProjectColor,
  getAvatarColorByIndex,
  getProjectColorByIndex,
  getStatusColor,
  getPriorityColor,
};
