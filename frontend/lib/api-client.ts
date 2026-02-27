// Mission Control API Client
// TypeScript client for communicating with the Mission Control API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = 'v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'ARCHIVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignee?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  completed_at?: string;
}

interface MemoryEntry {
  id: number;
  path: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
}

interface Agent {
  name: string;
  state: string;
  current_task?: string;
  card_path: string;
}

interface SystemStatus {
  timestamp: string;
  tasks: { active: number };
  memory: { entries: number };
}

class MissionControlClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || `${API_BASE_URL}/api/${API_VERSION}`;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Health check
  async health() {
    return this.request<{ status: string; version: string; timestamp: string }>(
      '/health'
    );
  }

  // Tasks API
  async getTasks(filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
    category?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ tasks: Task[]; count: number }>(`/tasks${query}`);
  }

  async getTask(id: string) {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Partial<Task>) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: Partial<Task>) {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async archiveTask(id: string) {
    return this.request<{ message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getTaskRelationships(id: string) {
    return this.request<{ dependencies: any[] }>(`/tasks/${id}/relationships`);
  }

  async linkToTask(id: string, link: { link_type: string; link_url: string; link_text?: string }) {
    return this.request<{ message: string; id: number }>(`/tasks/${id}/links`, {
      method: 'POST',
      body: JSON.stringify(link),
    });
  }

  // Memory API
  async searchMemory(query: string, limit = 20, offset = 0) {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) });
    return this.request<{ query: string; count: number; results: MemoryEntry[] }>(
      `/memory/search?${params.toString()}`
    );
  }

  async getMemory(id: number) {
    return this.request<MemoryEntry>(`/memory/${id}`);
  }

  async listMemory(category?: string, limit = 50) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (category) params.append('category', category);
    return this.request<{ memories: MemoryEntry[]; count: number }>(
      `/memory?${params.toString()}`
    );
  }

  async ingestMemory(filePath: string) {
    return this.request<{ message: string; id: number; path: string }>(
      '/memory/ingest',
      {
        method: 'POST',
        body: JSON.stringify({ path: filePath }),
      }
    );
  }

  async reindexMemory(directory?: string) {
    return this.request<{ message: string; files_processed: number; directory: string }>(
      '/memory/reindex',
      {
        method: 'POST',
        body: JSON.stringify({ directory }),
      }
    );
  }

  // Agents API
  async getAgents() {
    return this.request<{ agents: Agent[]; count: number }>('/agents');
  }

  async getAgent(name: string) {
    return this.request<Agent & { card: string }>(`/agents/${name}`);
  }

  async updateAgent(name: string, updates: { state?: string; current_task?: string }) {
    return this.request<{ message: string; name: string }>(`/agents/${name}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // System API
  async getSystemHealth() {
    return this.request<{
      status: string;
      uptime: { seconds: number; human: string };
      memory: { heap_used_mb: number; heap_total_mb: number; rss_mb: number };
      database: { status: string; path: string };
      system: {
        platform: string;
        arch: string;
        cpus: number;
        free_mem_gb: number;
        total_mem_gb: number;
      };
    }>('/system/health');
  }

  async getSystemMetrics() {
    return this.request<{ timestamp: string; tables: Record<string, number>; total_tables: number }>(
      '/system/metrics'
    );
  }

  async getSystemStatus() {
    return this.request<SystemStatus>('/system/status');
  }

  // Calendar API
  async getEvents(start?: string, end?: string) {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ events: any[]; count: number }>(`/calendar${query}`);
  }

  async getUpcomingEvents(days = 7) {
    return this.request<{ events: any[] }>(`/calendar/upcoming?days=${days}`);
  }

  async createEvent(event: any) {
    return this.request<any>('/calendar', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Cron API
  async getCronJobs() {
    return this.request<{ jobs: any[]; count: number }>('/cron/jobs');
  }

  async getCronJob(id: string) {
    return this.request<any>(`/cron/jobs/${id}`);
  }

  async getCronJobRuns(id: string) {
    return this.request<{ runs: any[] }>(`/cron/jobs/${id}/runs`);
  }

  async triggerCronJob(id: string) {
    return this.request<{ message: string }>(`/cron/jobs/${id}/run`, {
      method: 'POST',
    });
  }

  async getCronStatus() {
    return this.request<{ status: string; total_jobs: number; active_jobs: number }>(
      '/cron/status'
    );
  }

  // Sync API
  async syncTasks() {
    return this.request<{
      file: string;
      tasks: any[];
      count: number;
      last_modified: string;
    }>('/sync/tasks');
  }

  async updateSyncTask(id: string, updates: { status?: string; notes?: string }) {
    return this.request<{ message: string; id: string }>('/sync/tasks/update', {
      method: 'POST',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async syncAgents() {
    return this.request<{
      agents: any[];
      count: number;
      directory: string;
    }>('/sync/agents');
  }

  async syncAgent(name: string) {
    return this.request<{
      name: string;
      card: string;
      card_path: string;
      last_modified: string;
    }>(`/sync/agents/${name}`);
  }
}

// Export singleton instance
export const api = new MissionControlClient();

// Export class for custom instances
export { MissionControlClient };

// Export types
export type { Task, MemoryEntry, Agent, SystemStatus, ApiResponse };
