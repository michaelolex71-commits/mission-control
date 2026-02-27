'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Folder, Link as LinkIcon, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Task } from '@/lib/api-client';

interface TaskRelationship {
  task_id?: string;
  depends_on?: string;
}

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDetailModal({ taskId, isOpen, onClose, onEdit, onDelete }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [relationships, setRelationships] = useState<TaskRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (taskId && isOpen) {
      fetchTaskDetails(taskId);
    }
  }, [taskId, isOpen]);
  
  const fetchTaskDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch task details
      const taskRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${id}`);
      if (!taskRes.ok) throw new Error('Task not found');
      const taskData = await taskRes.json();
      setTask(taskData);
      
      // Fetch relationships
      const relRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${id}/relationships`);
      if (relRes.ok) {
        const relData = await relRes.json();
        setRelationships(relData.dependencies || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-600',
      ASSIGNED: 'bg-yellow-600',
      IN_PROGRESS: 'bg-purple-600',
      BLOCKED: 'bg-red-600',
      COMPLETED: 'bg-green-600',
      ARCHIVED: 'bg-gray-600',
    };
    return colors[status] || 'bg-gray-600';
  };
  
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: 'text-red-400',
      MEDIUM: 'text-yellow-400',
      LOW: 'text-green-400',
    };
    return colors[priority] || 'text-gray-400';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">
              {isLoading ? 'Loading...' : task?.title || 'Task Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {task && !isLoading && (
              <div className="space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                    <Flag className="h-4 w-4" />
                    {task.priority}
                  </span>
                </div>
                
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                    <p className="text-gray-200 whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {task.assignee && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Assignee: {task.assignee}</span>
                    </div>
                  )}
                  
                  {task.category && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Folder className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Category: {task.category}</span>
                    </div>
                  )}
                  
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Due: {formatDate(task.due_date)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Created: {formatDate(task.created_at)}</span>
                  </div>
                </div>
                
                {/* Relationships */}
                {relationships.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Dependencies
                    </h3>
                    <div className="space-y-2">
                      {relationships.map((rel, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-200">{rel.task_id || rel.depends_on}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timestamps */}
                <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
                  <p>Last updated: {formatDate(task.updated_at)}</p>
                  {task.completed_at && (
                    <p>Completed: {formatDate(task.completed_at)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {task && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
              {onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
