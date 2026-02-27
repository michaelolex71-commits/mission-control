// Deep Linking Utility
// Generates and parses shareable URLs for tasks, searches, and filters

import { useRouter, useSearchParams } from 'next/navigation';

// Types for deep link parameters
export interface TaskFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  category?: string;
}

export interface MemorySearchFilters {
  q?: string;
  category?: string;
  limit?: number;
}

export interface CalendarFilters {
  view?: 'day' | 'week' | 'month';
  date?: string; // ISO date string
}

// Generate shareable URLs
export function generateTaskUrl(taskId: string): string {
  return `/tasks/${taskId}`;
}

export function generateTasksListUrl(filters?: TaskFilters): string {
  if (!filters) return '/tasks';
  
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assignee) params.append('assignee', filters.assignee);
  if (filters.category) params.append('category', filters.category);
  
  const queryString = params.toString();
  return queryString ? `/tasks?${queryString}` : '/tasks';
}

export function generateMemorySearchUrl(filters?: MemorySearchFilters): string {
  if (!filters) return '/memory';
  
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.category) params.append('category', filters.category);
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const queryString = params.toString();
  return queryString ? `/memory/search?${queryString}` : '/memory';
}

export function generateCalendarUrl(filters?: CalendarFilters): string {
  if (!filters) return '/calendar';
  
  const params = new URLSearchParams();
  
  if (filters.view) params.append('view', filters.view);
  if (filters.date) params.append('date', filters.date);
  
  const queryString = params.toString();
  return queryString ? `/calendar?${queryString}` : '/calendar';
}

export function generateAgentUrl(agentName: string): string {
  return `/agents/${agentName}`;
}

export function generateCronJobUrl(jobId: string): string {
  return `/cron/jobs/${jobId}`;
}

// Parse URL parameters into filters
export function parseTaskFilters(searchParams: URLSearchParams): TaskFilters {
  return {
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    assignee: searchParams.get('assignee') || undefined,
    category: searchParams.get('category') || undefined,
  };
}

export function parseMemoryFilters(searchParams: URLSearchParams): MemorySearchFilters {
  return {
    q: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
  };
}

export function parseCalendarFilters(searchParams: URLSearchParams): CalendarFilters {
  return {
    view: (searchParams.get('view') as CalendarFilters['view']) || undefined,
    date: searchParams.get('date') || undefined,
  };
}

// React hook for deep linking
export function useDeepLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const shareCurrentView = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    return url;
  };
  
  const navigateToTasks = (filters?: TaskFilters) => {
    router.push(generateTasksListUrl(filters));
  };
  
  const navigateToMemory = (filters?: MemorySearchFilters) => {
    router.push(generateMemorySearchUrl(filters));
  };
  
  const navigateToTask = (taskId: string) => {
    router.push(generateTaskUrl(taskId));
  };
  
  const navigateToAgent = (agentName: string) => {
    router.push(generateAgentUrl(agentName));
  };
  
  return {
    shareCurrentView,
    navigateToTasks,
    navigateToMemory,
    navigateToTask,
    navigateToAgent,
    searchParams,
  };
}

// Example deep links:
// /tasks/T001 → View task T001
// /tasks?status=IN_PROGRESS&priority=HIGH → High priority in-progress tasks
// /memory/search?q=michael&category=daily-log → Search "michael" in daily logs
// /calendar?view=week&date=2026-02-27 → Week view starting Feb 27
// /agents/olex → View OLEX agent card
// /cron/jobs/abc123 → View cron job details
