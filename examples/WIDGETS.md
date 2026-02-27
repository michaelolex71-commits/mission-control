# Example Widgets

Custom widget examples for Mission Control.

## Widgets

### 1. Status Badge Widget

Simple status indicator for agents.

**File:** `examples/widgets/StatusBadge.tsx`

```typescript
import { Agent } from '@/lib/api-client';

interface StatusBadgeProps {
  agent: Agent;
}

export function StatusBadge({ agent }: StatusBadgeProps) {
  const colors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-red-500',
    standby: 'bg-gray-500',
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800">
      <div className={`w-2 h-2 rounded-full ${colors[agent.state]}`} />
      <span className="text-sm text-white capitalize">{agent.state}</span>
    </div>
  );
}
```

---

### 2. Task Counter Widget

Display task statistics.

**File:** `examples/widgets/TaskCounter.tsx`

```typescript
import { Task } from '@/lib/api-client';

interface TaskCounterProps {
  tasks: Task[];
}

export function TaskCounter({ tasks }: TaskCounterProps) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Task Stats</h2>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-sm text-gray-400">Done</p>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
          <p className="text-sm text-gray-400">Active</p>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{stats.blocked}</p>
          <p className="text-sm text-gray-400">Blocked</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Agent Timeline Widget

Show agent activity history.

**File:** `examples/widgets/AgentTimeline.tsx`

```typescript
interface TimelineEvent {
  timestamp: string;
  action: string;
  agent: string;
}

interface AgentTimelineProps {
  events: TimelineEvent[];
}

export function AgentTimeline({ events }: AgentTimelineProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-300">{event.action}</p>
              <p className="text-xs text-gray-500">
                {event.agent} • {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. Metric Chart Widget

Simple bar chart visualization.

**File:** `examples/widgets/MetricChart.tsx`

```typescript
interface Metric {
  label: string;
  value: number;
  max: number;
}

interface MetricChartProps {
  metrics: Metric[];
}

export function MetricChart({ metrics }: MetricChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Metrics</h2>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">{metric.label}</span>
              <span className="text-sm text-white">{metric.value}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(metric.value / metric.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## How to Use

1. **Copy widget file** to `frontend/components/`
2. **Import in dashboard:**
   ```typescript
   import { StatusBadge } from '@/components/StatusBadge';
   ```
3. **Use in JSX:**
   ```typescript
   <StatusBadge agent={agent} />
   ```

## Submitting Widgets

Created a cool widget? Share it!

1. Create widget in `examples/widgets/YourWidget.tsx`
2. Add documentation (comments, README)
3. Submit PR with `[Widget]` prefix
4. We'll review and add to the collection!

---

*More examples coming soon!*
