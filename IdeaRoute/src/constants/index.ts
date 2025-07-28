// Application constants
export const APP_NAME = 'IdeaRoute';
export const APP_VERSION = '1.0.0';

// Local storage keys
export const STORAGE_KEYS = {
  CHECKLIST_ITEMS: 'checklist-items',
  TIME_PLANNER_BLOCKS: 'time-planner-blocks',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme-preference'
} as const;

// Component categories for AI Generate
export const AI_CONTENT_TYPES = [
  { value: 'idea', label: 'Business Idea', icon: '💡' },
  { value: 'content', label: 'Content Ideas', icon: '📝' },
  { value: 'plan', label: 'Action Plan', icon: '📋' },
  { value: 'solution', label: 'Problem Solution', icon: '🔧' },
  { value: 'strategy', label: 'Strategy', icon: '🎯' },
  { value: 'creative', label: 'Creative Concept', icon: '🎨' }
] as const;

// Time planner categories
export const TIME_BLOCK_CATEGORIES = [
  { value: 'work', label: 'Work', color: '#3b82f6', icon: '💼' },
  { value: 'personal', label: 'Personal', color: '#10b981', icon: '👤' },
  { value: 'health', label: 'Health', color: '#f59e0b', icon: '🏃' },
  { value: 'learning', label: 'Learning', color: '#8b5cf6', icon: '📚' },
  { value: 'social', label: 'Social', color: '#ef4444', icon: '👥' },
  { value: 'break', label: 'Break', color: '#6b7280', icon: '☕' }
] as const;

// API endpoints (if needed in the future)
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNUP: '/api/auth/signup',
    SIGNOUT: '/api/auth/signout',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  USER: {
    PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences'
  }
} as const;
