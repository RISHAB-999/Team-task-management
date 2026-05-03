// Color Constants - Define all colors used throughout the app
export const COLORS = {
  // Primary Colors
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 241, 0.3)',
  primaryLight: 'rgba(99, 102, 241, 0.1)',

  // Accent Colors
  accent: '#a855f7',
  accentGlow: 'rgba(168, 85, 247, 0.3)',

  // Status Colors
  success: '#10b981',
  successGlow: 'rgba(16, 185, 129, 0.3)',
  successGlowStrong: 'rgba(16, 185, 129, 0.5)',
  successBorder: 'rgba(16, 185, 129, 0.4)',

  warning: '#f59e0b',
  warningGlow: 'rgba(245, 158, 11, 0.3)',

  danger: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',
  dangerGlowStrong: 'rgba(239, 68, 68, 0.5)',
  dangerBorder: 'rgba(239, 68, 68, 0.4)',

  // Text Colors
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textTertiary: '#475569',

  // Background Colors
  bg: '#0d0d15',
  bg2: 'rgba(27, 27, 35, 0.4)',
  bg3: 'rgba(27, 27, 35, 0.4)',
  glass: 'rgba(27, 27, 35, 0.4)',
  surface: 'rgba(255, 255, 255, 0.04)',
  surfaceHover: 'rgba(255, 255, 255, 0.07)',

  // Border Colors
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.02)',
  borderDark: 'rgba(0, 0, 0, 0.5)',

  // Priority Colors (for avatars and UI)
  avatarColors: [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ef4444', // red
    '#14b8a6', // teal
    '#f97316', // orange
  ],

  // Calendar & Timeline Colors
  calendarToday: '#6366f1',
  calendarTodayBg: 'rgba(99, 102, 241, 0.1)',
  calendarDayBg: 'rgba(255, 255, 255, 0.02)',
  calendarPast: '#94a3b8',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// CSS Variable Names (corresponding to index.css)
export const CSS_VARS = {
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  text: 'var(--text)',
  textSecondary: 'var(--text-2)',
  textTertiary: 'var(--text-3)',
  bg: 'var(--bg)',
  border: 'var(--border)',
  surface: 'var(--surface)',
  surfaceHover: 'var(--surface-hover)',
};

// Helper function to get avatar color by index
export const getAvatarColor = (index) => {
  return COLORS.avatarColors[index % COLORS.avatarColors.length];
};

// Helper function to get color by priority
export const getColorByPriority = (priority) => {
  const priorityMap = {
    high: COLORS.danger,
    medium: COLORS.warning,
    low: COLORS.primary,
  };
  return priorityMap[priority] || COLORS.primary;
};

// Helper function to get color by status
export const getColorByStatus = (status) => {
  const statusMap = {
    done: COLORS.success,
    todo: COLORS.textTertiary,
    in_progress: COLORS.primary,
  };
  return statusMap[status] || COLORS.primary;
};

export default COLORS;
