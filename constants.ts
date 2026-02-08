
import { TimeCategory, TimeEntry } from './types';

export const DEFAULT_CATEGORIES: TimeCategory[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'meetings', name: 'Meetings', color: '#8b5cf6' },
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'family', name: 'Family', color: '#f97316' },
  { id: 'exercise', name: 'Exercise', color: '#ef4444' },
  { id: 'sleep', name: 'Sleep', color: '#6366f1' },
  { id: 'learning', name: 'Learning', color: '#f59e0b' },
];

export const MOCK_TIME_ENTRIES: TimeEntry[] = [
    { id: 4, categoryId: 'exercise', durationMinutes: 45, description: 'Morning run', date: new Date().toISOString() },
    ];
