'use client';

import { useEffect, useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { api, SystemStatus, Task, Agent } from '@/lib/api-client';

interface DashboardStats {
  tasks: {
    total: number;
    byStatus: Record<string, number>;
  };
  memory: {
    entries: number;
  };
  agents: {
    total: number;
    byState: Record<string, number>;
  };
  cron: {
    total: number;
    healthy: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'task_created' | 'task_completed' | 'agent_status' | 'cron_run';
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Load system status
      const statusRes = await api.getSystemStatus();
      if (statusRes.data) {
        setStats({
          tasks: {
            total: statusRes.data.tasks.active,
            byStatus: {}, // Will be populated by tasks API
          },
          memory: {
            entries: statusRes.data.memory.entries,
          },
          agents: {
            total: 3,
            byState: {},
          },
          cron: {
            total: 44,
            healthy: 44,
          },
        });
      }
      
      // Load agents
      const agentsRes = await api.getAgents();
      if (agentsRes.data) {
        setAgents(agentsRes.data.agents);
      }
      
      // Load recent tasks
      const tasksRes = await api.getTasks({});
      if (tasksRes.data) {
        setRecentTasks(tasksRes.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Mission Control overview</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tasks"
          value={stats?.tasks.total || 0}
          icon={CheckSquare}
          color="blue"
        />
        <StatCard
          title="Memory Entries"
          value={stats?.memory.entries || 0}
          icon={Search}
          color="purple"
        />
        <StatCard
          title="Agents"
          value={stats?.agents.total || 0}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Cron Jobs"
          value={stats?.cron.total || 0}
          icon={Clock}
          color="yellow"
        />
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status Grid */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Status
          </h2>
          <AgentStatusGrid agents={agents} />
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </h2>
          <QuickActions />
        </div>
      </div>
      
      {/* Recent Tasks */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Tasks
        </h2>
        <RecentTasksList tasks={recentTasks} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
  };
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function AgentStatusGrid({ agents }: { agents: Agent[] }) {
  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-600',
      busy: 'bg-yellow-600',
      standby: 'bg-gray-600',
      offline: 'bg-red-600',
    };
    return colors[state.toLowerCase()] || 'bg-gray-600';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <div 
          key={agent.name}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${getStateColor(agent.state)}`} />
            <h3 className="text-white font-medium capitalize">{agent.name}</h3>
          </div>
          <p className="text-sm text-gray-400">State: {agent.state}</p>
          {agent.current_task && (
            <p className="text-sm text-gray-400 mt-1">Task: {agent.current_task}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'View All Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Search Memory', href: '/memory', icon: Search },
    { label: 'View Calendar', href: '/calendar', icon: Calendar },
    { label: 'Check Cron Jobs', href: '/cron', icon: Clock },
  ];
  
  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <action.icon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-200">{action.label}</span>
        </a>
      ))}
    </div>
  );
}

function RecentTasksList({ tasks }: { tasks: Task[] }) {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-600',
      ASSIGNED: 'bg-yellow-600',
      IN_PROGRESS: 'bg-purple-600',
      BLOCKED: 'bg-red-600',
      COMPLETED: 'bg-green-600',
    };
    return colors[status] || 'bg-gray-600';
  };
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No recent tasks
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <a
          key={task.id}
          href={`/tasks/${task.id}`}
          className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusBadge(task.status)}`}>
              {task.status}
            </span>
            <span className="text-gray-200">{task.title}</span>
          </div>
          <span className="text-sm text-gray-400">{task.id}</span>
        </a>
      ))}
    </div>
  );
}
