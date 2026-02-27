// Drag-and-Drop Task Status Update Hook
// Handles task movement between status columns with optimistic updates

import { useState, useCallback } from 'react';
import { api, Task } from '@/lib/api-client';

export type TaskStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'ARCHIVED';

export interface DragDropResult {
  success: boolean;
  task?: Task;
  error?: string;
}

export function useTaskStatusUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, TaskStatus>>(new Map());
  
  const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus): Promise<DragDropResult> => {
    setIsUpdating(true);
    
    // Optimistic update - immediately update local state
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.set(taskId, newStatus);
      return next;
    });
    
    try {
      // Call API to update task
      const response = await api.updateTask(taskId, { status: newStatus });
      
      if (response.error) {
        // Revert optimistic update on error
        setOptimisticUpdates(prev => {
          const next = new Map(prev);
          next.delete(taskId);
          return next;
        });
        
        return { success: false, error: response.error };
      }
      
      // Clear optimistic update after successful API call
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(taskId);
        return next;
      });
      
      return { success: true, task: response.data };
    } catch (error) {
      // Revert optimistic update on exception
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(taskId);
        return next;
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update task status' 
      };
    } finally {
      setIsUpdating(false);
    }
  }, []);
  
  const getTaskStatus = useCallback((task: Task): TaskStatus => {
    // Return optimistic status if available, otherwise return actual status
    return optimisticUpdates.get(task.id) || (task.status as TaskStatus);
  }, [optimisticUpdates]);
  
  const clearOptimisticUpdate = useCallback((taskId: string) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.delete(taskId);
      return next;
    });
  }, []);
  
  return {
    updateTaskStatus,
    getTaskStatus,
    isUpdating,
    clearOptimisticUpdate,
  };
}

// Drag event handlers for use with dnd-kit or similar libraries
export interface DragEvent {
  active: { id: string };
  over: { id: string; data?: { current?: { status: TaskStatus } } } | null;
}

export function useTaskDragHandlers(
  tasks: Task[],
  updateStatus: (taskId: string, status: TaskStatus) => Promise<DragDropResult>
) {
  const handleDragEnd = useCallback(async (event: DragEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id;
    const newStatus = over.data?.current?.status;
    
    if (!newStatus) {
      console.error('No status found in drop target');
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    // Don't update if status hasn't changed
    if (task.status === newStatus) return;
    
    const result = await updateStatus(taskId, newStatus);
    
    if (!result.success) {
      console.error('Failed to update task status:', result.error);
      // Could show a toast notification here
    }
  }, [tasks, updateStatus]);
  
  const handleDragStart = useCallback((event: DragEvent) => {
    // Optional: Add visual feedback or logging
    console.log('Drag started:', event.active.id);
  }, []);
  
  const handleDragOver = useCallback((event: DragEvent) => {
    // Optional: Add hover effects
  }, []);
  
  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
}

// Status column configuration
export const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'NEW', label: 'New', color: 'blue' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'yellow' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'purple' },
  { id: 'BLOCKED', label: 'Blocked', color: 'red' },
  { id: 'COMPLETED', label: 'Completed', color: 'green' },
];

// Utility to group tasks by status
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    NEW: [],
    ASSIGNED: [],
    IN_PROGRESS: [],
    BLOCKED: [],
    COMPLETED: [],
    ARCHIVED: [],
  };
  
  tasks.forEach(task => {
    const status = task.status as TaskStatus;
    if (grouped[status]) {
      grouped[status].push(task);
    }
  });
  
  return grouped;
}
