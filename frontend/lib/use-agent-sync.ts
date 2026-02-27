// Agent Card Live Sync Hook
// Polls agent status and provides real-time state updates

import { useState, useEffect, useCallback } from 'react';
import { api, Agent } from '@/lib/api-client';

export interface AgentSyncConfig {
  pollInterval?: number; // milliseconds (default: 30000)
  onStateChange?: (agent: Agent, oldState: string, newState: string) => void;
  onError?: (error: string) => void;
}

export function useAgentSync(config: AgentSyncConfig = {}) {
  const { 
    pollInterval = 30000, 
    onStateChange,
    onError 
  } = config;
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAgents = useCallback(async () => {
    try {
      const response = await api.getAgents();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        // Detect state changes
        if (onStateChange) {
          response.data.agents.forEach(newAgent => {
            const oldAgent = agents.find(a => a.name === newAgent.name);
            if (oldAgent && oldAgent.state !== newAgent.state) {
              onStateChange(newAgent, oldAgent.state, newAgent.state);
            }
          });
        }
        
        setAgents(response.data.agents);
        setLastSync(new Date());
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync agents';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [agents, onStateChange, onError]);
  
  // Initial fetch
  useEffect(() => {
    fetchAgents();
  }, []);
  
  // Polling
  useEffect(() => {
    const interval = setInterval(fetchAgents, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchAgents]);
  
  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchAgents();
  }, [fetchAgents]);
  
  // Get specific agent
  const getAgent = useCallback((name: string): Agent | undefined => {
    return agents.find(a => a.name.toLowerCase() === name.toLowerCase());
  }, [agents]);
  
  // Check if agent is available
  const isAgentAvailable = useCallback((name: string): boolean => {
    const agent = getAgent(name);
    return agent?.state.toLowerCase() === 'available';
  }, [getAgent]);
  
  // Get agents by state
  const getAgentsByState = useCallback((state: string): Agent[] => {
    return agents.filter(a => a.state.toLowerCase() === state.toLowerCase());
  }, [agents]);
  
  return {
    agents,
    isLoading,
    lastSync,
    error,
    refresh,
    getAgent,
    isAgentAvailable,
    getAgentsByState,
  };
}

// Agent state change notification helper
export function useAgentNotifications() {
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  
  const addNotification = useCallback((agent: Agent, oldState: string, newState: string) => {
    const notification: AgentNotification = {
      id: `${agent.name}-${Date.now()}`,
      agentName: agent.name,
      oldState,
      newState,
      timestamp: new Date(),
      message: `${agent.name} changed from ${oldState} to ${newState}`,
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);
  
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return {
    notifications,
    addNotification,
    dismissNotification,
    clearNotifications,
  };
}

export interface AgentNotification {
  id: string;
  agentName: string;
  oldState: string;
  newState: string;
  timestamp: Date;
  message: string;
}

// WebSocket connection for real-time updates (optional, falls back to polling)
export function useAgentWebSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    if (!url) return;
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Agent WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Agent WebSocket error:', error);
      setIsConnected(false);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('Agent WebSocket disconnected');
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [url]);
  
  const sendMessage = useCallback((data: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(data));
    }
  }, [socket, isConnected]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
