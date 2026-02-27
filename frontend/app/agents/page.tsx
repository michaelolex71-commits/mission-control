'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Activity, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { api, Agent, Task } from '@/lib/api-client';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentTasks, setAgentTasks] = useState<Record<string, Task[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadAgentsData();
  }, []);
  
  const loadAgentsData = async () => {
    setIsLoading(true);
    
    try {
      // Load agents
      const agentsRes = await api.getAgents();
      if (agentsRes.data) {
        setAgents(agentsRes.data.agents);
        
        // Load tasks for each agent
        const tasksMap: Record<string, Task[]> = {};
        for (const agent of agentsRes.data.agents) {
          const tasksRes = await api.getTasks({ assignee: agent.name });
          if (tasksRes.data) {
            tasksMap[agent.name] = tasksRes.data.tasks;
          }
        }
        setAgentTasks(tasksMap);
      }
    } catch (error) {
      console.error('Failed to load agents data:', error);
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
        <h1 className="text-3xl font-bold text-white">Agents</h1>
        <p className="text-gray-400 mt-1">Agent status and health monitoring</p>
      </div>
      
      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard 
            key={agent.name} 
            agent={agent} 
            tasks={agentTasks[agent.name] || []}
          />
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Summary
        </h2>
        <AgentSummary agents={agents} />
      </div>
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  tasks: Task[];
}

function AgentCard({ agent, tasks }: AgentCardProps) {
  const getStateColor = (state: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      available: { bg: 'bg-green-900', text: 'text-green-400', border: 'border-green-700' },
      busy: { bg: 'bg-yellow-900', text: 'text-yellow-400', border: 'border-yellow-700' },
      standby: { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700' },
      offline: { bg: 'bg-red-900', text: 'text-red-400', border: 'border-red-700' },
    };
    return colors[state.toLowerCase()] || colors.standby;
  };
  
  const stateColors = getStateColor(agent.state);
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  
  return (
    <div className={`bg-gray-900 border ${stateColors.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`${stateColors.bg} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${stateColors.bg} border-2 ${stateColors.border}`} />
            <h3 className="text-xl font-bold text-white capitalize">{agent.name}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stateColors.text} ${stateColors.bg}`}>
            {agent.state}
          </span>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Current Task */}
        {agent.current_task && (
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Task</p>
            <p className="text-white font-medium">{agent.current_task}</p>
          </div>
        )}
        
        {/* Task Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{activeTasks}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{completedTasks}</p>
          </div>
        </div>
        
        {/* Recent Tasks */}
        {tasks.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Recent Tasks</p>
            <div className="space-y-2">
              {tasks.slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  <span className="text-sm text-gray-200 truncate">{task.title}</span>
                  <TaskStatusBadge status={task.status} />
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Last Updated */}
        {/* {agent.last_updated && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {formatRelativeTime(agent.last_updated)}
          </div>
        )} */}
      </div>
    </div>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-600',
    ASSIGNED: 'bg-yellow-600',
    IN_PROGRESS: 'bg-purple-600',
    BLOCKED: 'bg-red-600',
    COMPLETED: 'bg-green-600',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${colors[status] || 'bg-gray-600'}`}>
      {status}
    </span>
  );
}

function AgentSummary({ agents }: { agents: Agent[] }) {
  const stateCounts = agents.reduce((acc, agent) => {
    acc[agent.state.toLowerCase()] = (acc[agent.state.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span className="text-sm text-gray-400">Available</span>
        </div>
        <p className="text-2xl font-bold text-white">{stateCounts.available || 0}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-yellow-600" />
          <span className="text-sm text-gray-400">Busy</span>
        </div>
        <p className="text-2xl font-bold text-white">{stateCounts.busy || 0}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <span className="text-sm text-gray-400">Standby</span>
        </div>
        <p className="text-2xl font-bold text-white">{stateCounts.standby || 0}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-sm text-gray-400">Offline</span>
        </div>
        <p className="text-2xl font-bold text-white">{stateCounts.offline || 0}</p>
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
